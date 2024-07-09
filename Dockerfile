FROM golang:1.22

ENV APP_HOME /go/src/forum
RUN mkdir -p "$APP_HOME"

WORKDIR "$APP_HOME"

# Install dependencies required for cgo and SQLite
RUN apt-get update && apt-get install -y gcc sqlite3 libsqlite3-dev

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project
COPY . .

# Build
RUN CGO_ENABLED=1 GOOS=linux go build -o /forum

EXPOSE 3000

# Run
CMD ["/forum"]

