import cv2
import os
import sys

def extract_frames(video_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error opening video stream or file: {video_path}")
        sys.exit(1)

    frame_count = 0
    target_width, target_height = 3840, 2160
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Total frames to extract: {total_frames}")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Resize to 4K (3840x2160)
        resized_frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)

        # Pad with 4 zeros: 0001, 0002, etc.
        frame_name = f"frame_{frame_count:04d}.jpg"
        output_path = os.path.join(output_dir, frame_name)

        # Save frame with moderate JPEG compression (60) to save disk space for the web
        cv2.imwrite(output_path, resized_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
        
        if frame_count % 50 == 0:
            print(f"Extracted {frame_count} / {total_frames} frames...")
        
        frame_count += 1

    cap.release()
    print(f"Successfully extracted {frame_count} frames to {output_dir}")
    
    # Save a metadata file so the frontend knows exactly how many frames were extracted
    with open(os.path.join(output_dir, "metadata.json"), "w") as f:
        f.write(f'{{"frameCount": {frame_count}}}')

if __name__ == "__main__":
    video_path = os.path.join("public", "video.mp4")
    output_dir = os.path.join("public", "frames")
    extract_frames(video_path, output_dir)
