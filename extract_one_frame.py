import cv2
import os
import sys

def extract_one_frame(video_path, output_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error opening video stream or file: {video_path}")
        sys.exit(1)

    ret, frame = cap.read()
    if ret:
        # Resize to 1080p
        resized = cv2.resize(frame, (1920, 1080), interpolation=cv2.INTER_AREA)
        cv2.imwrite(output_path, resized, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        print(f"Saved first frame to {output_path}")
    cap.release()

if __name__ == "__main__":
    video_path = os.path.join("public", "frames", "1.mp4")
    output_path = os.path.join("public", "bg.jpg")
    extract_one_frame(video_path, output_path)
