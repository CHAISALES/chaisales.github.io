import sys, subprocess, pathlib
from playwright.sync_api import sync_playwright
name=sys.argv[1]; dur=float(sys.argv[2]); fps=24
d=pathlib.Path('frames_'+name); d.mkdir(exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.goto(f'file://{pathlib.Path(name+".html").resolve()}'); pg.wait_for_timeout(500)
    n=int(dur*fps)
    for i in range(n):
        pg.evaluate(f'render({i/fps})'); pg.screenshot(path=str(d/f'{i:05d}.jpg'),type='jpeg',quality=88)
    b.close()
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(fps),'-i',str(d/'%05d.jpg'),'-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-shortest','-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','20','-c:a','aac','-movflags','+faststart',name+'.mp4'],check=True)
print('ok')
