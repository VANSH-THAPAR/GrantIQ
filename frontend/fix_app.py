import re
with open("C:/Vansh-hackathon-work/GrantIQ/frontend/src/pages/Wizard.jsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace bg classes
text = re.sub(r`<div className="bg-\[#F7F6F2\] text-on-surface">`, r`<div className="text-on-surface">`, text, 1)

with open("C:/Vansh-hackathon-work/GrantIQ/frontend/src/pages/Wizard.jsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Wizard bg updated")

