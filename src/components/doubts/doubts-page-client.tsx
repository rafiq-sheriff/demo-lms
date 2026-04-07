"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { ChatWindow } from "@/components/doubts/chat-window";
import { NewTicketModal, type NewTicketPayload } from "@/components/doubts/new-ticket-modal";
import { TicketList } from "@/components/doubts/ticket-list";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  closeTicket,
  createTicket,
  getTicket,
  listTickets,
  sendMessage,
  type TicketDetail,
} from "@/lib/api";
import type { DoubtTicket } from "@/lib/doubts-data";
import { useAuth } from "@/contexts/auth-context";

function mapDetailToDoubt(t: TicketDetail): DoubtTicket {
  return {
    id: t.id,
    title: t.subject,
    status: t.status === "open" ? "open" : "closed",
    messages: t.messages.map((m) => ({
      id: m.id,
      ticketId: t.id,
      body: m.body,
      sender: m.user_id === t.user_id ? "student" : "admin",
      at: m.created_at,
    })),
  };
}

export type DoubtsPageClientProps = {
  variant?: "student" | "admin";
};

export function DoubtsPageClient({ variant = "student" }: DoubtsPageClientProps) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const viewerRole = variant === "admin" ? "admin" : "student";

  const listQuery = useQuery({
    queryKey: ["tickets", variant],
    queryFn: () => listTickets(),
  });

  const [pickedTicketId, setPickedTicketId] = useState<string | null>(null);
  const activeId = pickedTicketId ?? listQuery.data?.[0]?.id ?? null;
  const [showNewModal, setShowNewModal] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["ticket", activeId],
    queryFn: () => getTicket(activeId!),
    enabled: Boolean(activeId),
  });

  const ticketsForList: DoubtTicket[] = useMemo(() => {
    if (!listQuery.data) return [];
    return listQuery.data.map((t) => ({
      id: t.id,
      title: t.subject,
      status: t.status === "open" ? "open" : "closed",
      messages: [],
      studentLabel:
        variant === "admin"
          ? (t.student_full_name?.trim() || t.student_email || "Student")
          : undefined,
    }));
  }, [listQuery.data, variant]);

  const activeTicket: DoubtTicket | null = useMemo(() => {
    if (!detailQuery.data) return null;
    return mapDetailToDoubt(detailQuery.data);
  }, [detailQuery.data]);

  const createMut = useMutation({
    mutationFn: (body: { subject: string; initial_message: string }) => createTicket(body),
    onSuccess: async (detail) => {
      await qc.invalidateQueries({ queryKey: ["tickets"] });
      await qc.invalidateQueries({ queryKey: ["ticket", detail.id] });
      setPickedTicketId(detail.id);
      setShowNewModal(false);
      toast.success("Ticket created");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Could not create ticket"),
  });

  const sendMut = useMutation({
    mutationFn: ({ ticketId, body }: { ticketId: string; body: string }) =>
      sendMessage(ticketId, { body }),
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({ queryKey: ["ticket", vars.ticketId] });
      await qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Could not send message"),
  });

  const closeMut = useMutation({
    mutationFn: (ticketId: string) => closeTicket(ticketId),
    onSuccess: async (_, ticketId) => {
      await qc.invalidateQueries({ queryKey: ["tickets"] });
      await qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
      toast.success("Ticket closed");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Could not close ticket"),
  });

  const handleSendMessage = useCallback(
    (body: string) => {
      if (!activeId) return;
      sendMut.mutate({ ticketId: activeId, body });
    },
    [activeId, sendMut],
  );

  const handleNewTicket = useCallback(
    (payload: NewTicketPayload) => {
      void createMut.mutateAsync({
        subject: payload.title,
        initial_message: payload.description,
      });
    },
    [createMut],
  );

  if (listQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-[minmax(0,20rem)_1fr]">
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
        <p className="font-medium text-foreground">Could not load tickets</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {listQuery.error instanceof ApiError ? listQuery.error.detail : "Try again later."}
        </p>
      </div>
    );
  }

  const isStudent = user?.role === "student";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="lms-page-title">Doubts</h1>
          <p className="lms-page-lead mt-1">
            {variant === "admin"
              ? "Reply to students — open threads on the left."
              : "Raise questions and get support in one place."}
          </p>
        </div>
        {variant === "student" && isStudent ? (
          <Button
            type="button"
            className="w-full shrink-0 gap-2 rounded-xl sm:w-auto"
            onClick={() => setShowNewModal(true)}
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Doubt
          </Button>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
        <div className="w-full shrink-0 md:w-[min(100%,20rem)] md:border-r md:border-border/80 md:pr-4">
          <TicketList
            tickets={ticketsForList}
            activeId={activeId}
            onSelect={setPickedTicketId}
            variant={variant}
          />
        </div>
        <div className="flex min-h-[24rem] flex-1 flex-col md:min-h-[32rem] md:pl-4">
          {detailQuery.isFetching && activeId ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-border/80 bg-card">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <ChatWindow
              ticket={activeTicket}
              onSendMessage={handleSendMessage}
              onCloseTicket={activeId ? () => closeMut.mutate(activeId) : undefined}
              closePending={closeMut.isPending}
              viewerRole={viewerRole}
            />
          )}
        </div>
      </div>

      {showNewModal ? (
        <NewTicketModal
          onClose={() => setShowNewModal(false)}
          onSubmit={handleNewTicket}
        />
      ) : null}
    </div>
  );
}
