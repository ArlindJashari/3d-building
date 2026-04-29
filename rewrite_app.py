import os
import re

with open('src/App.tsx', 'r') as f:
    content = f.text

content = re.sub(r"appTheme\.shell\s*=\s*'[^']*'", "appTheme.shell = 'min-h-screen relative overflow-hidden flex p-3 sm:p-5 gap-4 sm:gap-5'", content)

