FROM python:3.11-slim

# Hugging Face Spaces requires running as user 1000
RUN useradd -m -u 1000 user

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Give the user ownership of the app directory so SQLite can create the taxpro.db file
RUN chown -R user:user /app

# Switch to the new user
USER user

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
