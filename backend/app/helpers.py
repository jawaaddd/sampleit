import librosa
import numpy as np

def analyze_audio(file_obj) -> tuple[int, str]:
    """
    Returns (bpm, key) of the audio file.
    file_obj: a file-like object (e.g., UploadFile.file)
    """
    # librosa needs a path or numpy array; we can read directly from file object
    y, sr = librosa.load(file_obj, sr=None)  # load audio as waveform

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

    # Convert to scalar if numpy type
    if isinstance(tempo, np.ndarray):
        if tempo.size > 0:
            tempo = float(tempo[0])
        else:
            tempo = 0.0

    bpm = int(round(tempo)) if tempo else 0

    # Estimate key (rough method using chroma)
    chroma = librosa.feature.chroma_cens(y=y, sr=sr)
    chroma_sum = chroma.sum(axis=1)
    # Find the pitch class with the highest energy
    pitch_class = chroma_sum.argmax()
    key_map = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
    musical_key = key_map[pitch_class]

    return bpm, musical_key
