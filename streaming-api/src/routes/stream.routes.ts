import { Router } from 'express';
import { gdriveService } from '../services/gdrive.service.js';

export const streamRoutes = Router();

// ─── Stream video from Google Drive ──────────────
streamRoutes.get('/gdrive/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ error: 'fileId is required' });
      return;
    }

    // Get file metadata for content-length and type
    const fileInfo = await gdriveService.getFileInfo(fileId);
    const fileSize = fileInfo.size;
    const mimeType = fileInfo.mimeType || 'video/mp4';

    const range = req.headers.range;

    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      console.log(`[GDrive] Streaming ${fileId} range: ${start}-${end}/${fileSize}`);

      const { stream } = await gdriveService.streamFile(fileId, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      });

      stream.pipe(res);
    } else {
      console.log(`[GDrive] Streaming ${fileId} full file (${fileSize} bytes)`);

      const { stream } = await gdriveService.streamFile(fileId);

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      });

      stream.pipe(res);
    }
  } catch (err: any) {
    console.error('[GDrive] Stream error:', err.message);
    if (err.code === 404 || err.status === 404) {
      res.status(404).json({ error: 'File not found on Google Drive' });
    } else if (err.code === 403 || err.status === 403) {
      res.status(403).json({ error: 'Access denied. Check Google Drive sharing permissions.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ─── Get file info from Google Drive ─────────────
streamRoutes.get('/info/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const info = await gdriveService.getFileInfo(fileId);
    res.json(info);
  } catch (err: any) {
    console.error('[GDrive] Info error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
