const fs = require('fs');
const path = require('path');
const randomNumber = require('random-number');

const PATH_TO_FFMPEG = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { getVideoDurationInSeconds } = require('get-video-duration');

ffmpeg.setFfmpegPath(PATH_TO_FFMPEG);

async function main() {
  try {
    const videosDirPath = path.join(__dirname, 'videos');
    const videos = await fs.promises.readdir(videosDirPath);

    const randomIndex = randomNumber({
      min: 0,
      max: videos.length - 1,
      integer: true
    });
    const randomVideo = path.join(videosDirPath, videos[randomIndex]);

    const totalDuration = await getVideoDurationInSeconds(randomVideo);
    const freezeFrameTimestamp = randomNumber({
      min: 0,
      max: totalDuration
    });

    ffmpeg(randomVideo)
      .screenshot({
        timestamps: [freezeFrameTimestamp],
        filename: 'output.png'
      })
      .once('error', (e) => {
        throw e;
      })
      .once('end', () => console.log('Freeze-frame saved to output.png'));
  } catch (error) {
    console.error(error);
  }
}

main();
