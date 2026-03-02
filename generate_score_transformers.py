import torch
import scipy.io.wavfile
from transformers import AutoProcessor, MusicgenForConditionalGeneration

def generate_video_score():
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"🚀 Using device: {device}")

    print("Loading MusicGen-Large (3.3B parameters)... This will take a moment to download weights.")
    # Initialize processor and model
    processor = AutoProcessor.from_pretrained("facebook/musicgen-large")
    model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-large").to(device)

    # The background video is exactly 8 seconds long.
    # MusicGen produces 50 tokens per second of audio.
    target_seconds = 8
    max_new_tokens = int(target_seconds * 50) # 400 tokens

    prompt = [
        "Cinematic ambient electronica, slow deep sub-bass pulses. "
        "Intricate, cascading polyrhythmic analog synth arpeggios that sound like liquid data. "
        "Ethereal, floating, high-frequency choral pads. High-tech, intellectual, mysterious, "
        "and awe-inspiring tone. Microscopic digital universe. Evolving and shifting textures. "
        "No traditional drums, seamless atmospheric flow."
    ]

    print("Processing prompt...")
    inputs = processor(
        text=prompt,
        padding=True,
        return_tensors="pt",
    )
    
    # Move inputs to MPS device
    inputs = {k: v.to(device) for k, v in inputs.items()}

    print(f"Generating {target_seconds} seconds of audio... Listen to your Mac's fans spin up!")
    audio_values = model.generate(**inputs, max_new_tokens=max_new_tokens)

    # Save audio
    output_path = "frontend-design/frontend/public/custom_score.wav"
    sampling_rate = model.config.audio_encoder.sampling_rate
    scipy.io.wavfile.write(output_path, rate=sampling_rate, data=audio_values[0, 0].cpu().numpy())
    print(f"✅ Generation Complete! Audio saved successfully to {output_path}!")

if __name__ == "__main__":
    generate_video_score()
