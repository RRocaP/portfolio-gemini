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

    # Max typical token generation without overlap-add is 1500 tokens (30 seconds)
    target_seconds = 30
    max_new_tokens = int(target_seconds * 50) # 1500 tokens

    prompt = [
        "Deep cinematic boom, chill atmospheric electronica, wow factor, massive scale but relaxing, "
        "evolving soundscape, slow deep sub-bass pulses, ethereal floating high-frequency choral pads. "
        "High-tech, intellectual, mysterious. No traditional drums, seamless atmospheric flow."
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
    output_path = "frontend-design/frontend/public/custom_score_30s.wav"
    sampling_rate = model.config.audio_encoder.sampling_rate
    scipy.io.wavfile.write(output_path, rate=sampling_rate, data=audio_values[0, 0].cpu().numpy())
    print(f"✅ Generation Complete! Audio saved successfully to {output_path}!")

if __name__ == "__main__":
    generate_video_score()