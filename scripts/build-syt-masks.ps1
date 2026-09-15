# Build SVG display masks only. Source PNGs are never modified.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Text;
public static class SytDisplayMask {
  public static string Build(string file) {
    using (var bitmap = new Bitmap(file)) {
      int w = bitmap.Width, h = bitmap.Height;
      var corner = bitmap.GetPixel(0,0);
      bool darkMatte = corner.A > 240 && corner.R < 25 && corner.G < 25 && corner.B < 25;
      var exterior = new bool[w*h];
      var white = new bool[w*h];
      var queue = new int[w*h];
      for (int y=0; y<h; y++) for (int x=0; x<w; x++) {
        var c = bitmap.GetPixel(x,y);
        white[y*w+x] = c.A < 20 || (darkMatte
          ? c.R < 22 && c.G < 22 && c.B < 22
          : c.R > 232 && c.G > 232 && c.B > 232);
      }
      int head=0, tail=0;
      for (int y=0; y<h; y++) for (int x=0; x<w; x++) {
        int i=y*w+x;
        if ((x==0 || y==0 || x==w-1 || y==h-1) && white[i]) {
          exterior[i]=true; queue[tail++]=i;
        }
      }
      while (head<tail) {
        int i=queue[head++], x=i%w, y=i/w;
        int[] neighbors={ x>0?i-1:-1, x<w-1?i+1:-1, y>0?i-w:-1, y<h-1?i+w:-1 };
        foreach (int j in neighbors) if(j>=0 && white[j] && !exterior[j]) {
          exterior[j]=true; queue[tail++]=j;
        }
      }
      var path = new StringBuilder();
      for (int y=0; y<h; y+=3) {
        for(int x=0; x<w; x++) {
          if(exterior[y*w+x]) continue;
          int start=x;
          while(x<w && !exterior[y*w+x]) x++;
          path.Append("M").Append(start).Append(' ').Append(y).Append('h').Append(x-start)
            .Append('v').Append(Math.Min(3,h-y)).Append('h').Append(start-x).Append('z');
        }
      }
      return path.ToString();
    }
  }
}
'@
$projectRoot = Split-Path $PSScriptRoot -Parent
$sources = [ordered]@{
  run = 'mujer/correr/ChatGPT Image 15 sept 2026, 14_39_07.png'
  attack = 'mujer/atacar/ChatGPT Image 15 sept 2026, 14_50_35.png'
  jump = 'mujer/saltar/ChatGPT Image 15 sept 2026, 14_45_30.png'
  chip = 'mujer/lanzar objetos/ChatGPT Image 15 sept 2026, 14_54_30.png'
  mouse = 'objetos/ChatGPT Image 15 sept 2026, 15_06_17.png'
  router = 'objetos/ChatGPT Image 15 sept 2026, 15_05_33.png'
}
$lines = @('// SVG display masks; preserve original sheets and enclosed white details.', 'export const sytMasks = {')
foreach ($entry in $sources.GetEnumerator()) {
  $source = Join-Path $projectRoot "assets/Syt/$($entry.Value)"
  $pathData = [SytDisplayMask]::Build($source)
  $lines += "  $($entry.Key): '$pathData',"
}
$lines += '}'
[System.IO.File]::WriteAllLines((Join-Path $projectRoot 'src/game/characters/syt/sytMasks.js'), $lines)
