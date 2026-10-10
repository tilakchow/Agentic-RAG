FROM python:3.14-slim

# Install uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv (without installing the project code yet to cache layers)
RUN uv sync --frozen --no-dev --no-install-project

# Copy the rest of the application code
COPY README.md ./
COPY src/ ./src/

# Install the project itself
RUN uv sync --frozen --no-dev

# Expose port for FastAPI (Hugging Face Spaces requires 7860)
EXPOSE 7860

# Run the FastAPI app directly from the virtual environment. 
# We use the shell form so $PORT is evaluated (Defaults to 7860 for Hugging Face).
CMD /app/.venv/bin/uvicorn src.agenticrag.api:app --host 0.0.0.0 --port ${PORT:-7860}
