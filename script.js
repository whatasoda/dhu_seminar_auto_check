;
(function () {
    var PARSE_LESSON_BLOCK_START = /科目分類\t科目分野\t学則グループ\t学則科目\t教員名\t単位数\t評価\t年度\t開講時期/m;
    var PARSE_LESSON_BLOCK_END = /\t総取得単位数\t/m;
    function parseLessons(input) {
        var start = input.match(PARSE_LESSON_BLOCK_START);
        var end = input.match(PARSE_LESSON_BLOCK_END);
        if (!(start && start.index && end && end.index))
            return alert('入力形式を確認してください。');
        var table = input.slice(start.index + start[0].length, end.index).split('\n').map(function (line) {
            return line.split('\t').map(function (item) { return item.trim(); });
        });
        return table
            .map(function (row) { return [row[3] ? fixFormat(row[3]) : '', !!(row[3] && row[6] !== '不可')]; })
            .filter(function (_a) {
            var name = _a[0], isValid = _a[1];
            return isValid;
        })
            .map(function (_a) {
            var name = _a[0];
            return name;
        });
    }
    var apply = function () {
        var input = document.getElementById('Source').value;
        if (!input)
            return alert('ページをリロードしてみてください。');
        var lessons = parseLessons(input);
        var distText = ";(" + dist.toString().replace('__LESSONS_STR__', JSON.stringify(JSON.stringify(lessons))) + ")()";
        document.getElementById('Dist').value = distText;
    };
    var __LESSONS_STR__ = '';
    var dist = function () {
        var targets = Array.from(document.querySelectorAll('.inner>label'));
        var targetMapStr = targets.reduce(function (prev, curr, i) { return prev + (";" + i + ":" + curr.textContent.trim() + ";"); }, '');
        var lessons = JSON.parse(__LESSONS_STR__);
        var failed = lessons
            .map(function (lesson) { return [lesson, new RegExp(";([0-9]*):" + lesson + ".*?;")]; })
            .filter(function (_a) {
            var lesson = _a[0], pattern = _a[1];
            var match = targetMapStr.match(pattern);
            if (!match)
                return true;
            var index = parseInt(match[1]);
            if (isNaN(index))
                return true;
            var target = targets[index];
            if (!target)
                return true;
            var input = target.querySelector(':scope>input');
            if (!input)
                return true;
            if (!input.checked)
                input.click();
            return false;
        })
            .map(function (_a) {
            var lesson = _a[0];
            return lesson;
        });
        if (failed.length) {
            var form = document.getElementById('myForm');
            var notif = document.createElement('div');
            notif.innerHTML = "\u4EE5\u4E0B\u306E\u8B1B\u7FA9\u306F\u81EA\u52D5\u30C1\u30A7\u30C3\u30AF\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u624B\u52D5\u3067\u30C1\u30A7\u30C3\u30AF\u3092\u5165\u308C\u3066\u304F\u3060\u3055\u3044\u3002<br><br>" + failed.join('<br>');
            notif.style.fontSize = '30px';
            notif.style.color = 'red';
            form.insertBefore(notif.cloneNode(), form.firstChild);
            form.insertBefore(notif.cloneNode(), form.lastChild);
            alert('自動チェックに失敗した講義があります。（講義名のフォーマットが揃っていないせいなので僕はなにも悪くない。）');
        }
    };
    var fixFormat = function (lesson) {
        return lesson
            .replace(/([a-zⅠⅡⅢⅣ])(?=[A-Z])/g, '$1 ')
            .replace(/-.*$/, '');
    };
    document.getElementById('submit').onclick = apply;
})();
