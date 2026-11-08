import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { env } from '../env';

export const uploadDir = path.resolve(env.UPLOAD_DIR);

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdir(uploadDir, { recursive: true })
        .then(() => cb(null, uploadDir))
        .catch((err) => cb(err as Error, uploadDir));
    },
    filename: (_req, _file, cb) => cb(null, `${randomUUID()}.pdf`)
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('pdf_only'));
      return;
    }
    cb(null, true);
  }
});

export async function readUploaded(path: string): Promise<Buffer> {
  return fs.readFile(path);
}

export async function deleteUploaded(path: string): Promise<void> {
  try {
    await fs.unlink(path);
  } catch {
    /* ignore */
  }
}