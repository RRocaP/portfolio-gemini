import torch
import torchaudio
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
from moviepy.editor import VideoFileClip
import os

def generate_video_score(video_path, output_path):
    print(f"Analyzing video: {video_path}")
    
    # 1. Extract exact duration from the video
    try:
        video = VideoFileClip(video_path)
        duration = int(video.duration)
        print(f"Video duration detected: {duration} seconds")
    except Exception as e:
        print(f"Could not read video duration, defaulting to 60 seconds. Error: {e}")
        duration = 60

    # 2. Configure Apple Silicon (MPS) Acceleration
    if torch.backends.mps.is_available():
        device = 'mps'
        print("🚀 Apple M4 Pro Metal Acceleration (MPS) Enabled!")
    else:
        device = 'cpu'
        print("⚠️ MPS not available, falling back to CPU.")

    # 3. Load the largest, highest-fidelity model
    print("Loading MusicGen-Large (3.3B parameters)... This may take a moment to download weights.")
    model = MusicGen.get_pretrained('facebook/musicgen-large', device=device)

    # 4. Set Generation Parameters
    # We set it to generate the exact length of your video so it loops perfectly with the visual
    model.set_generation_params(
        use_sampling=True,
        top_k=250,
        duration=duration
    )

    # 5. The highly-specific prompt matching our Refik Anadol aesthetic
    prompt = [
        "Cinematic ambient electronica, slow deep sub-bass pulses. "
        "Intricate, cascading polyrhythmic analog synth arpeggios that sound like liquid data. "
        "Ethereal, floating, high-frequency choral pads. High-tech, intellectual, mysterious, "
        "and awe-inspiring tone. Microscopic digital universe. Evolving and shifting textures. "
        "No traditional drums, seamless atmospheric flow."
    ]

    print(f"Generating {duration} seconds of audio... Listen to your Mac's fans spin up!")
    
    # Generate the audio
    # Note: For very long durations (>30s), Audiocraft automatically uses an overlap-add 
    # continuation technique under the hood to stitch the chunks together seamlessly.
    output = model.generate(descriptions=prompt, progress=True)

    # 6. Save the High-Fidelity Output
    print(f"Saving high-fidelity output to {output_path}...")
    
    # audio_write automatically adds the .wav extension
    audio_write(
        output_path, 
        output[0].cpu(), 
        model.sample_rate, 
        strategy="loudness", 
        loudness_compressor=True
    )
    
    print("✅ Generation Complete! You can now convert it to .mp3 or use the .wav directly in your project.")

if __name__ == "__main__":
    video_file = "frontend-design/frontend/public/background.mp4"
    output_file = "frontend-design/frontend/public/custom_score"
    
    generate_video_score(video_file, output_file)
