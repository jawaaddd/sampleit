import os
from s3_utils import upload_fileobj

def main():
    # Pick a test file in the current directory
    test_files = ["yo.m4a"]

    if not test_files:
        print("No files found in this directory to upload.")
        return

    for fname in test_files:
        with open(fname, "rb") as f:
            print(f"Uploading {fname} ...")
            url = upload_fileobj(f, fname)
            print(f"✅ Uploaded {fname} → {url}")

if __name__ == "__main__":
    main()
