import boto3, os
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_DEFAULT_REGION")
)

BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

def upload_fileobj(file_path, key):
    with open(file_path, "rb") as f:
        s3.upload_fileobj(f, BUCKET_NAME, key)
    return f"https://{BUCKET_NAME}.s3.amazonaws.com/{key}"
