const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
require('dotenv').config();

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convert OGG file to WAV
 * @param {string} inputPath - Path to OGG file
 * @returns {Promise<string>} - Path to converted WAV file
 */
function convertOggToWav(inputPath) {
    return new Promise((resolve, reject) => {
        const outputPath = inputPath.replace('.ogg', '.wav');

        ffmpeg(inputPath)
            .toFormat('wav')
            .on('error', (err) => {
                console.error('❌ FFmpeg conversion error:', err);
                reject(err);
            })
            .on('end', () => {
                console.log('✅ Converted to WAV:', outputPath);
                resolve(outputPath);
            })
            .save(outputPath);
    });
}

/**
 * Transcribe voice message using Wit.ai
 * @param {string} filePath - Path to the audio file (OGG)
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeVoice(filePath) {
    let wavPath = null;

    try {
        if (!process.env.WIT_AI_TOKEN) {
            throw new Error('WIT_AI_TOKEN not configured in .env file');
        }

        // Convert OGG to WAV first
        console.log('🎤 Converting voice message to WAV...');
        wavPath = await convertOggToWav(filePath);

        const stats = fs.statSync(wavPath);
        console.log(`🎤 WAV file size: ${stats.size} bytes`);

        const audioStream = fs.createReadStream(wavPath);

        const response = await axios.post(
            'https://api.wit.ai/speech?v=20230215',
            audioStream,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WIT_AI_TOKEN}`,
                    'Content-Type': 'audio/wav'
                }
            }
        );

        // Wit.ai returns a stream of JSON objects if chunks are sent
        // We need to parse the response data which might be a string containing multiple JSONs
        let text = '';

        if (typeof response.data === 'string') {
            const parts = response.data.split('}\r\n{');

            // Try to find the final response or the last part
            for (let i = parts.length - 1; i >= 0; i--) {
                let jsonStr = parts[i];
                // Fix braces if they were removed by split
                if (!jsonStr.startsWith('{')) jsonStr = '{' + jsonStr;
                if (!jsonStr.endsWith('}')) jsonStr = jsonStr + '}';

                try {
                    const data = JSON.parse(jsonStr);
                    if (data.text) {
                        text = data.text;
                        // If we found the final one, break
                        if (data.is_final) break;
                    }
                } catch (e) {
                    console.log('Skipping invalid JSON part:', e.message);
                }
            }
        } else if (response.data && typeof response.data === 'object') {
            text = response.data.text || response.data._text || '';
        }

        if (!text) {
            console.log('Wit.ai response (raw):', response.data);
            throw new Error('No transcription received from Wit.ai');
        }

        return text;
    } catch (error) {
        console.error('❌ Voice transcription error:', error.message);

        const logData = `[${new Date().toISOString()}] Error: ${error.message}\n`;
        fs.appendFileSync(path.join(__dirname, '../../debug.log'), logData);

        if (error.response) {
            const details = JSON.stringify(error.response.data, null, 2);
            console.error('Error Details:', details);
            fs.appendFileSync(path.join(__dirname, '../../debug.log'), `Details: ${details}\n`);
        }
        throw error;
    } finally {
        // Clean up WAV file
        if (wavPath && fs.existsSync(wavPath)) {
            try {
                fs.unlinkSync(wavPath);
            } catch (e) {
                console.error('⚠️ Failed to delete WAV file:', e.message);
            }
        }
    }
}

/**
 * Download voice file from Telegram
 * @param {Object} bot - Telegram bot instance
 * @param {string} fileId - Telegram file ID
 * @returns {Promise<string>} - Path to downloaded file
 */
async function downloadVoiceFile(bot, fileId) {
    try {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Get file info from Telegram
        const file = await bot.getFile(fileId);

        // Download file
        const fileName = `voice_${Date.now()}.ogg`;
        const filePath = path.join(tempDir, fileName);

        await bot.downloadFile(file.file_id, tempDir);

        // Rename to our filename
        const downloadedPath = path.join(tempDir, path.basename(file.file_path));
        if (fs.existsSync(downloadedPath)) {
            fs.renameSync(downloadedPath, filePath);
        }

        return filePath;
    } catch (error) {
        console.error('❌ Voice download error:', error.message);
        throw error;
    }
}

/**
 * Clean up temporary voice file
 * @param {string} filePath - Path to file to delete
 */
function cleanupVoiceFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('⚠️ Failed to cleanup voice file:', error.message);
    }
}

module.exports = {
    transcribeVoice,
    downloadVoiceFile,
    cleanupVoiceFile
};
