import asyncio
from typing import Optional
import os
from dotenv import load_dotenv
load_dotenv()


async def generate_speech(
    message: str,
    model: str = "tts-1",
    voice: str = "nova",
    filename: Optional[str] = None,
    response_format: str = "mp3"
) -> str:
    """
    Generate speech audio bytes from text using OpenAI TTS and save to file.
    Returns the file path of the saved audio (mp3 or opus).
    """
    try:
        from openai import AsyncOpenAI as OpenAI  # type: ignore
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            "Please install 'openai' >= 1.0 and set credentials.") from e

    client = OpenAI(
        organization=os.getenv("OPENAI_ORGANIZATION"),
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    # Set file extension based on response_format
    ext = "mp3" if response_format == "mp3" else "opus"
    audio_dir = "audio"
    os.makedirs(audio_dir, exist_ok=True)
    if not filename:
        filename = f"speech_output.{ext}"
    filepath = os.path.join(audio_dir, filename)

    # type: ignore[attr-defined]
    audio = await client.audio.speech.create(
        model=model,
        voice=voice,
        input=message,
        response_format=response_format
    )

    # Get bytes from response
    if hasattr(audio, "content") and isinstance(audio.content, (bytes, bytearray)):
        audio_bytes = bytes(audio.content)
    elif hasattr(audio, "array_buffer"):
        buf = await audio.array_buffer()  # type: ignore
        audio_bytes = bytes(buf)
    elif hasattr(audio, "to_bytes"):
        audio_bytes = await audio.to_bytes()  # type: ignore
    else:
        raise RuntimeError("Unsupported response shape for TTS output.")

    # Save to file in audio folder
    with open(filepath, "wb") as f:
        f.write(audio_bytes)

    return filepath


lines = [
    {"line": "Slow down", "filename": "slow_down.mp3"},
    {"line": "go deeper", "filename": "go_deeper.mp3"},
    {"line": "Perfect squat", "filename": "perfect_squat.mp3"},
    {"line": "excellent form", "filename": "excellent_form.mp3"},
    {"line": "Ensure your full body is visible to the camera.",
        "filename": "visibility.mp3"},
    {"line": "Keep knees behind toes!", "filename": "knees_behind_toes.mp3"},
    {"line": "Keep chest up!", "filename": "chest_up.mp3"},
    {"line": "Avoid overextending your elbow!", "filename": "elbow_extension.mp3"},
    {"line": "Ensure a full range of motion!",
        "filename": "full_range_motion.mp3"},
    {"line": "Ensure your full arm is visible to the camera.",
        "filename": "full_arm_visibility.mp3"},
    {"line": "Good rep!", "filename": "good_rep.mp3"},
    {"line": "Great form! Keep it up!", "filename": "great_form.mp3"}
]


async def main():
    for item in lines:
        await generate_speech(item["line"], filename=item["filename"])

if __name__ == "__main__":
    asyncio.run(main())
