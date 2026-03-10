export class WorkerError extends Error {
  constructor(message, code = "WORKER_ERROR", status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
