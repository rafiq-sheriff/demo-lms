"""Extract YouTube video id from common URL shapes."""

import re


def extract_youtube_id(url: str) -> str | None:
    s = url.strip()
    if not s:
        return None
    patterns = [
        r"(?:youtube\.com/embed/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com/watch\?v=)([a-zA-Z0-9_-]{11})",
        r"(?:youtu\.be/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com/shorts/)([a-zA-Z0-9_-]{11})",
    ]
    for p in patterns:
        m = re.search(p, s)
        if m:
            return m.group(1)
    return None


def build_lesson_content_from_youtube_url(url: str) -> str:
    vid = extract_youtube_id(url)
    if not vid:
        return f'<p>Course video: <a href="{url}">Open link</a></p>'
    return (
        f'<p>Intro video</p>'
        f'<p><a href="https://www.youtube.com/watch?v={vid}">Watch on YouTube</a></p>'
        f'<p>https://www.youtube.com/embed/{vid}</p>'
    )
