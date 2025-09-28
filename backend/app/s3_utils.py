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

def upload_fileobj(file_obj, filename: str, uuid):
    key = f"samples/{uuid}-{filename}"
    s3.upload_fileobj(
        file_obj,
        BUCKET_NAME,
        key
    )
    return f"https://{BUCKET_NAME}.s3.amazonaws.com/{key}"
