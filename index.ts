import { readdir, rename, stat } from "node:fs/promises";

const subtitle_ext_names = [".srt", ".ass"];
const video_ext_names = [".mp4", ".mkv", ".webm"];

const pwd = await Bun.$`pwd`.text();
const files = await readdir(pwd.trim(), { recursive: true });

let good_videos: string[] = [];
let good_subtitles: string[] = [];
files.forEach(async (file_path) => {
  if (await good_video_check(file_path)) good_videos.push(file_path);
  if (good_subtitle_check(file_path)) good_subtitles.push(file_path);
});

const si = setInterval(() => {
  console.log(good_subtitles.length, good_videos.length);
  if (good_subtitles.length === good_videos.length) {
    clearInterval(si);
    good_videos = good_videos.sort();
    good_subtitles = good_subtitles.sort();

    console.log(good_videos, good_subtitles);
    for (let i = 0; i < good_subtitles.length; i++) {
      Bun.write(
        good_videos[i].replace(current_video_ext, current_subtitle_ext),
        Bun.file(good_subtitles[i]),
      );
    }
  }
}, 500);

let current_video_ext: string;
async function good_video_check(file_path: string) {
  let is_video = false;
  video_ext_names.forEach((n) => {
    if (file_path.endsWith(n)) {
      is_video = true;
      current_video_ext = n;
    }
  });
  if (!is_video) return false;
  else {
    if ((await stat(file_path)).size > 500000000) {
      return true;
    }
    return false;
  }
}

let current_subtitle_ext: string;
function good_subtitle_check(file_path: string) {
  let is_subtitle = false;
  for (let n of subtitle_ext_names) {
    if (file_path.endsWith(n)) {
      is_subtitle = true;
      current_subtitle_ext = n;
      break;
    }
  }
  return is_subtitle;
}
