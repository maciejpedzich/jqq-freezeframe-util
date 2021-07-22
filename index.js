const fs = require('fs');

const ytdl = require('ytdl-core');
const randomNumber = require('random-number');

const PATH_TO_FFMPEG = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

const VIDEO_URLS = [
  'https://www.youtube.com/watch?v=DLAfYt8QFDY',
  'https://www.youtube.com/watch?v=mvWSD-5G4Yw',
  'https://www.youtube.com/watch?v=xET89nLf_l0'
];

ffmpeg.setFfmpegPath(PATH_TO_FFMPEG);

async function main() {
  try {
    console.log('Choosing random video and scraping metadata...');

    const randomIndex = randomNumber({
      min: 0,
      max: VIDEO_URLS.length - 1,
      integer: true
    });
    const ytdlInfo = await ytdl.getInfo(VIDEO_URLS[randomIndex]);
    const targetFormat = ytdlInfo.formats.find(
      (f) =>
        f.mimeType?.startsWith('video/mp4') &&
        f.qualityLabel.startsWith('1080p')
    );
    const { approxDurationMs } = targetFormat;

    console.log('Downloading video...');

    ytdl
      .downloadFromInfo(ytdlInfo)
      .pipe(fs.createWriteStream('temp.mp4'))
      .once('finish', () => {
        console.log('Grabbing random frame...');

        const randomFrameTimestamp = randomNumber({
          min: 0,
          max: Math.floor(parseInt(approxDurationMs, 10) / 1000),
          integer: true
        });

        ffmpeg('temp.mp4')
          .screenshot({
            timestamps: [randomFrameTimestamp],
            filename: 'output.png',
            size: '1080x?'
          })
          .once('end', () => {
            fs.unlinkSync('temp.mp4');
            console.log('Done! Frame saved to output.png');
            process.exit(1);
          });
      });
  } catch (error) {
    console.error(error);
  }
}

main();
