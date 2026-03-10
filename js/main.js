// Main JavaScript for UI Interactions

document.addEventListener('DOMContentLoaded', () => {
    // --- Countdown Timer ---
    const entranceDate = new Date('2026-04-03T09:45:00');
    const daysLeftElement = document.getElementById('days-left');

    function updateCountdown() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const entranceDayStart = new Date(
            entranceDate.getFullYear(),
            entranceDate.getMonth(),
            entranceDate.getDate()
        );
        const diff = entranceDayStart - todayStart;

        if (diff > 0) {
            const days = Math.round(diff / (1000 * 60 * 60 * 24));
            daysLeftElement.innerText = days;
        } else {
            daysLeftElement.innerText = '0';
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000 * 60 * 60); // Update every hour

    // --- Scroll Reveal Animation ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // --- Chat Widget Logic ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWidget = document.getElementById('chat-widget');
    const closeChatBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');

    // Open/Close
    chatToggleBtn.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatToggleBtn.style.display = 'none';
        userInput.focus();
    });

    closeChatBtn.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        chatToggleBtn.style.display = 'block';
    });

    // Send Message
    function sendMessage() {
        const text = userInput.value.trim();
        if (text === '') return;

        // Add User Message to Chat
        addMessage(text, 'user');
        userInput.value = '';

        // Get Bot Response from Agent
        if (typeof agent !== 'undefined') {
            const response = agent.generateResponse(text);

            // Artificial delay for realism
            setTimeout(() => {
                addMessage(response, 'bot');
            }, 500);
        } else {
            addMessage('エラーが発生しました。エージェントが読み込まれていません。', 'bot');
        }
    }

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);

        // Parsing Markdown-like bolding (**text**) for simple formatting
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        msgDiv.innerHTML = formattedText;

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to bottom
    }

    // --- Timetable Builder ---
    const semesterSelect = document.getElementById('semester-select');
    const timetableGridBody = document.getElementById('timetable-grid-body');
    const resetTimetableBtn = document.getElementById('reset-timetable');
    const downloadTimetableBtn = document.getElementById('download-timetable-pdf');
    const creditSummary = document.getElementById('credit-summary');
    const selectedCourseList = document.getElementById('selected-course-list');
    const timetableDataNote = document.getElementById('timetable-data-note');

    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const dayLabels = {
        mon: '月',
        tue: '火',
        wed: '水',
        thu: '木',
        fri: '金'
    };
    const syllabusYear = '2025';

    const creditRequirements = [
        { key: 'overall', label: '全学教育科目 合計', required: 39 },
        { key: 'foundationRequired', label: '基盤科目必修（学問論/自然科学総合実験/スポーツA）', required: 5 },
        { key: 'foundationHumanSocial', label: '基盤科目 人文・社会（各2単位以上）', required: 4 },
        { key: 'advancedRequired', label: '先進科目必修（情報とデータの基礎）', required: 2 },
        { key: 'languageEnglish', label: '言語科目 英語', required: 6 },
        { key: 'languageInitial', label: '言語科目 初修語', required: 4 },
        { key: 'academicRequired', label: '学術基礎科目必修（生命科学B/C）', required: 4 }
    ];

    const courses = [
        { code: 'CB13101', name: '学問論', credits: 2, category: '基盤科目', requirementTags: ['foundationRequired'], semesters: ['1q_1sem'], slots: [{ day: 'mon', period: 3 }, { day: 'mon', period: 4 }, { day: 'mon', period: 5 }], requiredByDefault: true },
        { code: 'CB43105', name: '自然科学総合実験', credits: 2, category: '基盤科目', requirementTags: ['foundationRequired'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 3 }, { day: 'thu', period: 4 }], requiredByDefault: true },
        { code: 'CB32110', name: 'スポーツA', credits: 1, category: '基盤科目', requirementTags: ['foundationRequired'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 2 }], requiredByDefault: true },
        { code: 'CB23106', name: '情報とデータの基礎', credits: 2, category: '先進科目', requirementTags: ['advancedRequired'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 3 }], requiredByDefault: true },
        { code: 'CB22128', name: '英語I-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 2 }], requiredByDefault: true },
        { code: 'CB51113', name: '英語I-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 1 }], requiredByDefault: true },
        { code: 'CB13203', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }], requiredByDefault: true },
        { code: 'CB13204', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13205', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13213', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB54202', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }], requiredByDefault: true },
        { code: 'CB54203', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54204', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54205', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54206', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54207', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB33114', name: '基礎ドイツ語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33119', name: '基礎フランス語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33122', name: '基礎スペイン語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33124', name: '基礎中国語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB25114', name: '基礎ロシア語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB25116', name: '基礎朝鮮語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB41111', name: '生命科学B', credits: 2, category: '学術基礎科目', requirementTags: ['academicRequired'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 1 }], requiredByDefault: true },
        { code: 'CB54101', name: '生命科学C', credits: 2, category: '学術基礎科目', requirementTags: ['academicRequired'], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 4 }], requiredByDefault: true },
        { code: 'CB21101', name: '物理学概論I', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 1 }] },
        { code: 'CB31103', name: '化学A', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB31101', name: '線形代数学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB52101', name: '数理統計学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 2 }] },
        { code: 'CB42101', name: '論理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42103', name: '倫理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42105', name: '歴史学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42109', name: '社会学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42111', name: '経済と社会', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42113', name: '法学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42114', name: '政治学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB24105', name: '生命科学A', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB33111', name: '文化と社会の探求', credits: 2, category: '先進科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'thu', period: 1 }] },
        { code: 'CB55101', name: '実践的機械学習I', credits: 2, category: '先進科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB45101', name: '情報教育特別講義', credits: 2, category: '先進科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 5 }] },

        { code: 'CB31201', name: '哲学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31202', name: '倫理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31206', name: '歴史学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31211', name: '法学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31212', name: '政治学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB24202', name: '物理学概論II', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB25201', name: 'データ科学・AI概論', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB25214', name: '基礎ロシア語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB25216', name: '基礎朝鮮語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB25217', name: '基礎朝鮮語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB33220', name: '基礎ドイツ語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33225', name: '基礎フランス語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33228', name: '基礎スペイン語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33230', name: '基礎中国語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB35202', name: '情報教育特別講義（統計数理モデリング）', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB42210', name: '多文化特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB45201', name: '情報教育特別講義（AIをめぐる人間と社会）', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'thu', period: 5 }] },
        { code: 'CB55202', name: '実践的機械学習II', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB55210', name: 'SDGs入門', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55211', name: 'アルゴリズミック思考の基礎', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] }
    ];

    const semesters = {
        '1q_1sem': {
            label: '1年次第1学期（1セメ）',
            detailedSlots: true,
            dataNote: '曜日・時限・単位は、指定されたQSLシラバスURL規則と時間割PDFを突合して設定。初修語I/IIは初期状態で未選択。'
        },
        '2q_2sem': {
            label: '1年次第2学期（2セメ）',
            detailedSlots: true,
            dataNote: '2セメも曜日・時限付きで作成済み（時間割PDF＋QSLシラバス確認）。初修語I/IIは連動選択に対応。'
        }
    };
    const linkedInitialLanguageMap = {
        CB33114: 'CB33220',
        CB33220: 'CB33114',
        CB33119: 'CB33225',
        CB33225: 'CB33119',
        CB33122: 'CB33228',
        CB33228: 'CB33122',
        CB33124: 'CB33230',
        CB33230: 'CB33124',
        CB25114: 'CB25214',
        CB25214: 'CB25114',
        CB25116: 'CB25216',
        CB25216: 'CB25116',
        CB25217: 'CB25116'
    };
    const semesterSelections = {
        '1q_1sem': {},
        '2q_2sem': {}
    };
    const semesterSelectionStorageKey = 'tohoku_med_semester_selections_v1';

    function getCoursesForSemester(semesterKey) {
        return courses.filter(course => course.semesters.includes(semesterKey));
    }

    function loadSemesterSelections() {
        try {
            const raw = window.localStorage.getItem(semesterSelectionStorageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                semesterSelections['1q_1sem'] = parsed['1q_1sem'] || {};
                semesterSelections['2q_2sem'] = parsed['2q_2sem'] || {};
            }
        } catch (error) {
            console.warn('Failed to load semester selections from localStorage.', error);
        }
    }

    function persistSemesterSelections() {
        try {
            window.localStorage.setItem(semesterSelectionStorageKey, JSON.stringify(semesterSelections));
        } catch (error) {
            console.warn('Failed to save semester selections to localStorage.', error);
        }
    }

    function getCoursesForSlot(semesterKey, day, period) {
        const semesterCourses = getCoursesForSemester(semesterKey);
        const exact = semesterCourses.filter(course => (
            Array.isArray(course.slots) && course.slots.some(slot => slot.day === day && slot.period === period)
        ));
        if (semesters[semesterKey].detailedSlots) {
            return exact;
        }
        return semesterCourses;
    }

    function getSyllabusUrl(code) {
        return `https://qsl.cds.tohoku.ac.jp/qsl/syllabus/display/${code.toLowerCase()}-${syllabusYear}`;
    }

    function getCellKey(day, period) {
        return `${day}-${period}`;
    }

    function getCourseByCode(code) {
        return courses.find(item => item.code === code);
    }

    function isCurrentSemesterRendered() {
        return Boolean(timetableGridBody && timetableGridBody.children.length > 0);
    }

    function removeCourseFromSemesterSelection(semesterKey, courseCode) {
        const next = { ...(semesterSelections[semesterKey] || {}) };
        Object.keys(next).forEach(key => {
            if (next[key] === courseCode) {
                next[key] = '';
            }
        });
        semesterSelections[semesterKey] = next;
        persistSemesterSelections();
    }

    function addCourseToSemesterSelection(semesterKey, courseCode) {
        const course = getCourseByCode(courseCode);
        if (!course) return;

        const next = { ...(semesterSelections[semesterKey] || {}) };
        const hasAlready = Object.values(next).includes(courseCode);
        if (hasAlready) {
            semesterSelections[semesterKey] = next;
            persistSemesterSelections();
            return;
        }

        const slots = Array.isArray(course.slots) ? course.slots : [];
        let assigned = false;
        for (let i = 0; i < slots.length; i += 1) {
            const key = getCellKey(slots[i].day, slots[i].period);
            if (!next[key]) {
                next[key] = courseCode;
                assigned = true;
                break;
            }
        }
        if (!assigned && slots.length > 0) {
            const key = getCellKey(slots[0].day, slots[0].period);
            next[key] = courseCode;
        }

        semesterSelections[semesterKey] = next;
        persistSemesterSelections();
    }

    function setCourseSelection(courseCode, shouldSelect) {
        const course = getCourseByCode(courseCode);
        if (!course) return;
        const semesterKey = course.semesters[0];
        if (!semesterKey) return;

        if (shouldSelect) {
            addCourseToSemesterSelection(semesterKey, courseCode);
        } else {
            removeCourseFromSemesterSelection(semesterKey, courseCode);
        }

        if (semesterSelect.value !== semesterKey || !isCurrentSemesterRendered()) return;

        if (shouldSelect) {
            const availableSelects = Array.from(timetableGridBody.querySelectorAll('.timetable-select'))
                .filter(select => select.querySelector(`option[value="${courseCode}"]`));
            const existing = availableSelects.find(select => select.value === courseCode);
            if (existing) {
                existing.dataset.prev = existing.value || '';
                return;
            }
            const emptySelect = availableSelects.find(select => select.value === '');
            if (emptySelect) {
                emptySelect.value = courseCode;
                emptySelect.dataset.prev = courseCode;
                return;
            }
            if (availableSelects.length > 0) {
                availableSelects[0].value = courseCode;
                availableSelects[0].dataset.prev = courseCode;
            }
            return;
        }

        timetableGridBody.querySelectorAll('.timetable-select').forEach(select => {
            if (select.value === courseCode) {
                select.value = '';
                select.dataset.prev = '';
            }
        });
    }

    function syncLinkedInitialLanguage(prevCode, currentCode) {
        const prevLinked = linkedInitialLanguageMap[prevCode];
        const currentLinked = linkedInitialLanguageMap[currentCode];

        if (prevLinked && prevLinked !== currentLinked) {
            setCourseSelection(prevLinked, false);
        }
        if (currentLinked) {
            setCourseSelection(currentLinked, true);
        }
    }

    function createCourseOptionsHtml(courseOptions) {
        let html = '<option value="">（未選択）</option>';
        courseOptions.forEach(course => {
            const label = `${course.code} ${course.name} / ${course.credits}単位 / ${course.category}`;
            html += `<option value="${course.code}">${label}</option>`;
        });
        return html;
    }

    function renderTimetableGrid() {
        const semesterKey = semesterSelect.value;
        let rowsHtml = '';

        for (let period = 1; period <= 5; period += 1) {
            rowsHtml += `<tr><td>${period}</td>`;
            dayKeys.forEach(day => {
                const slotCourses = getCoursesForSlot(semesterKey, day, period);
                const optionsHtml = createCourseOptionsHtml(slotCourses);
                rowsHtml += `<td><select class="timetable-select" data-day="${day}" data-period="${period}">${optionsHtml}</select></td>`;
            });
            rowsHtml += '</tr>';
        }

        timetableGridBody.innerHTML = rowsHtml;
        applySavedSelections(semesterKey);
        applyDefaultRequiredSelections(semesterKey);
        saveCurrentSemesterSelections();
        timetableDataNote.textContent = semesters[semesterKey].dataNote;
        bindTimetableSelectEvents();
        updateCreditSummary();
    }

    function applySavedSelections(semesterKey) {
        const saved = semesterSelections[semesterKey] || {};
        Object.keys(saved).forEach(key => {
            const [day, period] = key.split('-');
            const selector = `.timetable-select[data-day="${day}"][data-period="${period}"]`;
            const select = timetableGridBody.querySelector(selector);
            if (!select) return;
            const code = saved[key];
            if (!code) return;
            if (select.querySelector(`option[value="${code}"]`)) {
                select.value = code;
            }
        });
    }

    function applyDefaultRequiredSelections(semesterKey) {
        const requiredCourses = getCoursesForSemester(semesterKey).filter(course => course.requiredByDefault);
        requiredCourses.forEach(course => {
            const preferredSlots = Array.isArray(course.slots) ? course.slots : [];
            let assignedAny = false;

            for (let i = 0; i < preferredSlots.length; i += 1) {
                const slot = preferredSlots[i];
                const selector = `.timetable-select[data-day="${slot.day}"][data-period="${slot.period}"]`;
                const select = timetableGridBody.querySelector(selector);
                if (!select) continue;
                if (!select.querySelector(`option[value="${course.code}"]`)) continue;
                if (select.value === '') {
                    select.value = course.code;
                    assignedAny = true;
                }
            }

            if (assignedAny) return;

            const fallback = Array.from(timetableGridBody.querySelectorAll('.timetable-select'))
                .find(select => select.value === '' && select.querySelector(`option[value="${course.code}"]`));
            if (fallback) {
                fallback.value = course.code;
            }
        });
    }

    function bindTimetableSelectEvents() {
        timetableGridBody.querySelectorAll('.timetable-select').forEach(select => {
            select.dataset.prev = select.value || '';
            select.addEventListener('change', () => {
                const prevCode = select.dataset.prev || '';
                const currentCode = select.value || '';
                syncLinkedInitialLanguage(prevCode, currentCode);
                select.dataset.prev = currentCode;
                saveCurrentSemesterSelections();
                updateCreditSummary();
            });
        });
    }

    function saveCurrentSemesterSelections() {
        const semesterKey = semesterSelect.value;
        const next = {};
        timetableGridBody.querySelectorAll('.timetable-select').forEach(select => {
            const day = select.dataset.day;
            const period = select.dataset.period;
            const key = getCellKey(day, period);
            next[key] = select.value || '';
        });
        semesterSelections[semesterKey] = next;
        persistSemesterSelections();
    }

    function resetTimetable() {
        semesterSelections[semesterSelect.value] = {};
        persistSemesterSelections();
        renderTimetableGrid();
    }

    function getSelectedCourses() {
        const selectedCodes = new Set();
        const selected = [];

        timetableGridBody.querySelectorAll('.timetable-select').forEach(select => {
            const courseCode = select.value;
            if (!courseCode || selectedCodes.has(courseCode)) return;
            const course = courses.find(item => item.code === courseCode);
            if (!course) return;
            selectedCodes.add(courseCode);
            selected.push(course);
        });

        return selected;
    }

    function getSelectionDataForGrid() {
        const rows = [];
        for (let period = 1; period <= 5; period += 1) {
            const row = { period };
            dayKeys.forEach(day => {
                const selector = `.timetable-select[data-day="${day}"][data-period="${period}"]`;
                const code = timetableGridBody.querySelector(selector)?.value || '';
                const course = getCourseByCode(code);
                row[day] = course ? `${course.code} ${course.name}` : '-';
            });
            rows.push(row);
        }
        return rows;
    }

    function getSelectedCoursesForSemester(semesterKey) {
        const saved = semesterSelections[semesterKey] || {};
        const uniqueCodes = new Set(Object.values(saved).filter(Boolean));
        return Array.from(uniqueCodes)
            .map(code => getCourseByCode(code))
            .filter(Boolean);
    }

    function getUniqueMergedCourses(courseListA, courseListB) {
        const map = new Map();
        [...courseListA, ...courseListB].forEach(course => {
            map.set(course.code, course);
        });
        return Array.from(map.values());
    }

    function calculateProgress(selectedCourses) {
        const earned = {
            overall: 0,
            foundationRequired: 0,
            foundationHumanSocial: 0,
            advancedRequired: 0,
            languageEnglish: 0,
            languageInitial: 0,
            academicRequired: 0
        };

        selectedCourses.forEach(course => {
            earned.overall += course.credits;
            course.requirementTags.forEach(tag => {
                if (Object.prototype.hasOwnProperty.call(earned, tag)) {
                    earned[tag] += course.credits;
                }
            });
        });

        return earned;
    }

    function updateCreditSummary() {
        saveCurrentSemesterSelections();

        const sem1Courses = getSelectedCoursesForSemester('1q_1sem');
        const sem2Courses = getSelectedCoursesForSemester('2q_2sem');
        const mergedCourses = getUniqueMergedCourses(sem1Courses, sem2Courses);
        const earned = calculateProgress(mergedCourses);
        const sem1Credits = sem1Courses.reduce((sum, course) => sum + course.credits, 0);
        const sem2Credits = sem2Courses.reduce((sum, course) => sum + course.credits, 0);
        const combinedCredits = sem1Credits + sem2Credits;

        let summaryHtml = '<h4>必要単位の進捗</h4>';
        summaryHtml += `<p>1セメ合計: <strong>${sem1Credits}</strong> 単位 / 2セメ合計: <strong>${sem2Credits}</strong> 単位 / 1〜2セメ合計: <strong>${combinedCredits}</strong> 単位</p>`;
        summaryHtml += '<table><thead><tr><th>区分</th><th>取得</th><th>必要</th><th>残り</th></tr></thead><tbody>';

        creditRequirements.forEach(rule => {
            const got = earned[rule.key];
            const remain = Math.max(rule.required - got, 0);
            const cls = remain === 0 ? 'ok' : 'ng';
            summaryHtml += `<tr><td>${rule.label}</td><td>${got}</td><td>${rule.required}</td><td class="${cls}">${remain}</td></tr>`;
        });

        summaryHtml += '</tbody></table>';
        creditSummary.innerHTML = summaryHtml;

        if (mergedCourses.length === 0) {
            selectedCourseList.innerHTML = '<li>まだ科目が選択されていません。</li>';
            return;
        }

        selectedCourseList.innerHTML = mergedCourses
            .sort((a, b) => a.code.localeCompare(b.code))
            .map(course => {
                const slotText = Array.isArray(course.slots) && course.slots.length > 0
                    ? course.slots.map(slot => `${dayLabels[slot.day]}${slot.period}限`).join('・')
                    : '曜日・時限: 未設定';
                const syllabusUrl = getSyllabusUrl(course.code);
                return `<li>${course.code} ${course.name} / ${course.credits}単位 / ${course.category} / ${slotText} / <a href="${syllabusUrl}" target="_blank" rel="noopener noreferrer">シラバス</a></li>`;
            })
            .join('');
    }

    function buildExportNode(semesterLabel, dataRows, selectedCourses, earned) {
        const wrapper = document.createElement('div');
        wrapper.style.width = '1080px';
        wrapper.style.padding = '24px';
        wrapper.style.background = '#ffffff';
        wrapper.style.color = '#111111';
        wrapper.style.fontFamily = '"Noto Sans JP", sans-serif';

        const title = document.createElement('h1');
        title.textContent = `東北大学医学部 My時間割 (${semesterLabel})`;
        title.style.margin = '0 0 10px';
        title.style.fontSize = '28px';
        wrapper.appendChild(title);

        const stamp = document.createElement('p');
        stamp.textContent = `作成日: ${new Date().toLocaleString('ja-JP')}`;
        stamp.style.margin = '0 0 8px';
        stamp.style.fontSize = '16px';
        wrapper.appendChild(stamp);

        const source = document.createElement('p');
        source.textContent = '参照: 2025年度医学部医学科授業時間割表 / 令和7年度学生便覧 / QSLシラバス';
        source.style.margin = '0 0 14px';
        source.style.fontSize = '14px';
        wrapper.appendChild(source);

        const progress = document.createElement('p');
        progress.textContent = `全学教育科目 合計: ${earned.overall} / 39 単位`; 
        progress.style.margin = '0 0 14px';
        progress.style.fontSize = '16px';
        wrapper.appendChild(progress);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        const headerRow = document.createElement('tr');
        ['時限', '月', '火', '水', '木', '金'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.border = '1px solid #7b8b9a';
            th.style.padding = '10px';
            th.style.background = '#e9f0f7';
            th.style.fontSize = '16px';
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        dataRows.forEach(row => {
            const tr = document.createElement('tr');
            const periodCell = document.createElement('td');
            periodCell.textContent = String(row.period);
            periodCell.style.border = '1px solid #7b8b9a';
            periodCell.style.padding = '10px';
            periodCell.style.textAlign = 'center';
            periodCell.style.fontWeight = '700';
            tr.appendChild(periodCell);

            dayKeys.forEach(day => {
                const td = document.createElement('td');
                td.textContent = row[day] || '-';
                td.style.border = '1px solid #7b8b9a';
                td.style.padding = '10px';
                td.style.fontSize = '14px';
                tr.appendChild(td);
            });

            table.appendChild(tr);
        });

        wrapper.appendChild(table);

        const listTitle = document.createElement('h2');
        listTitle.textContent = '選択科目（単位・区分）';
        listTitle.style.margin = '16px 0 8px';
        listTitle.style.fontSize = '20px';
        wrapper.appendChild(listTitle);

        const ul = document.createElement('ul');
        ul.style.margin = '0';
        ul.style.paddingLeft = '20px';
        selectedCourses.forEach(course => {
            const li = document.createElement('li');
            li.textContent = `${course.code} ${course.name} / ${course.credits}単位 / ${course.category}`;
            li.style.fontSize = '14px';
            li.style.marginBottom = '4px';
            ul.appendChild(li);
        });
        wrapper.appendChild(ul);

        return wrapper;
    }

    async function exportTimetablePdf() {
        if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF出力ライブラリの読み込みに失敗しました。ページを再読み込みしてください。');
            return;
        }

        const semesterLabel = semesters[semesterSelect.value].label;
        const dataRows = getSelectionDataForGrid();
        const selectedCourses = getSelectedCourses();
        const earned = calculateProgress(selectedCourses);
        const tempNode = buildExportNode(semesterLabel, dataRows, selectedCourses, earned);
        tempNode.style.position = 'fixed';
        tempNode.style.left = '-99999px';
        tempNode.style.top = '0';
        document.body.appendChild(tempNode);

        try {
            const canvas = await window.html2canvas(tempNode, {
                scale: 2,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pageHeight - 20);
            }

            const dateStamp = new Date().toISOString().slice(0, 10);
            pdf.save(`tohoku-med-timetable-${dateStamp}.pdf`);
        } catch (error) {
            alert('PDF出力中にエラーが発生しました。もう一度お試しください。');
            console.error(error);
        } finally {
            tempNode.remove();
        }
    }

    if (semesterSelect && timetableGridBody && resetTimetableBtn && downloadTimetableBtn && creditSummary && selectedCourseList && timetableDataNote) {
        loadSemesterSelections();
        renderTimetableGrid();
        semesterSelect.addEventListener('change', () => {
            saveCurrentSemesterSelections();
            renderTimetableGrid();
        });
        resetTimetableBtn.addEventListener('click', resetTimetable);
        downloadTimetableBtn.addEventListener('click', exportTimetablePdf);
    }

    // --- Smooth Scroll for Navigation ---
    document.querySelectorAll('header nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
