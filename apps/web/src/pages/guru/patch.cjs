const fs = require('fs');
const file = 'apps/web/src/pages/guru/TeacherAssignmentDetailPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state
if (!content.includes('editingScoreIds')) {
  content = content.replace(
    "const [classFilter, setClassFilter] = useState<string>('Semua');",
    "const [classFilter, setClassFilter] = useState<string>('Semua');\n  const [editingScoreIds, setEditingScoreIds] = useState<number[]>([]);"
  );
}

// 2. Replace UI block
const newBlock = fs.readFileSync('apps/web/src/pages/guru/new_block.tsx', 'utf8');

const startStr = "{sub.student_note && (";
const endStr = "Beri Nilai\n                    </button>\n                  </div>\n                </div>";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx + endStr.length);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Success!");
} else {
  console.log("Failed to find UI block boundaries. startIdx: " + startIdx + ", endIdx: " + endIdx);
}
