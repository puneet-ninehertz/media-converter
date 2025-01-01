const cors = require('cors');
const express = require('express');
const app = express()
const port = 9800;

const { search, ytmp3, ytmp4 } = require('@vreden/youtube_scraper');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello world')
})


app.post('/api/video-to-mp3', (req, res) => {
    
    var { youtubeUrl } = req.body;
    
    console.log(youtubeUrl);
    if (!youtubeUrl) {
        return res.status(400).json({ success: false, message: 'YouTube URL is required.' });
    }

    convertAndUploadToFileIO(youtubeUrl)
        .then((url) => {
            console.log('Shareable link:', url);
            res.json({ success: true, link: url });
        })
        .catch((err) => {
            console.error('Failed:', err.message);
            res.status(500).json({ success: false, message: err.message });
        });
});


async function convertAndUploadToFileIO(youtubeUrl, quality = '320') {
    try {
        console.log('Starting audio extraction from YouTube...');

        // Extract MP3 from YouTube using ytmp3
        const result = await ytmp3(youtubeUrl, quality);

        // Check if the result has a valid status
        if (result.status) {
            console.log('Download Link:', result.download);
            console.log('Metadata:', result.metadata);
            return result.download.url;
            /*
            // Download the audio using the provided download link
            const response = await axios.get(result.download.url, { responseType: 'stream' });

            console.log('response.data', response);

            // Create FormData for File.io
            const formData = new FormData();
            formData.append('file', response.data, { filename: 'output.mp3' });

            console.log('Uploading to File.io...');
            const uploadResponse = await axios.post('https://file.io', formData, {
                headers: formData.getHeaders(),
            });

            // Check if the upload was successful
            if (uploadResponse.data.success) {
                console.log('Upload successful. File link:', uploadResponse.data.link);
                return uploadResponse.data.link; // Return the file link
            } else {
                throw new Error('File.io upload failed.');
            }*/
        } else {
            throw new Error('Error fetching MP3 download link: ' + result.result);
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}


app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
})