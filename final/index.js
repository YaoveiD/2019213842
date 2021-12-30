// 关卡
const qboards = [
	"34 3"+"    "+"3__3"+" 2  "+"1111",	// classic
    "3333"+"    "+"2 4 "+"11  "+"1__1", // easiest
    "34 3"+"    "+"3113"+" 11 "+"1__1",
    "14 1"+"1  1"+"2 2 "+"2 2 "+"1__1",
    "34 3"+"    "+"1111"+"2 2 "+"1__1",
    "34 3"+"    "+"32 3"+" 11 "+"1__1",
    "14 1"+"3  3"+" 11 "+"32 3"+" __ ",
    "34 3"+"    "+"2 2 "+"12 1"+"1__1",
    "12 1"+"34 3"+"    "+"1__1"+"2 2 ",
    "14 1"+"3  3"+" _3 "+"1_ 1"+"2 2 ",
    "333_"+"   _"+"1111"+"2 4 "+"2   ",
];

// pos尝试往dir方向移动后盘面的变化
const move_piece = (board, pos, dir) => {
    const to = {
        u: [0, -1],
        d: [0, 1],
        l: [-1, 0],
        r: [1, 0],
    }[dir];
    
    const dx = to[0];
    const dy = to[1];
    let b = board.split("");
    const c = b[pos];
    
    let x0 = pos % 4;
    let y0 = parseInt(pos / 4);
    
    let size = {
        1: {w:1, h:1},
        2: {w:2, h:1},
        3: {w:1, h:2},
        4: {w:2, h:2},
    }[c];

    if (!size) return;
    let h = size.h;
    let w = size.w;

    // 移动方向是墙
    if ((x0 + dx < 0) || (4 <= x0 + dx + w - 1)) return null;
    if ((y0 + dy < 0) || (5 <= y0 + dy + h - 1)) return null;

    for (let i = 0; i < w; i++)
        for (let j = 0; j < h; j++)
            b[(x0 + i) + (y0 + j) * 4] = "_";

    for (let i = 0; i < w; i++)
        for (let j = 0; j < h; j++) {
            let pos = (x0 + i + dx) + (y0 + j + dy) * 4;
            
            if (b[pos] != "_")
                return null;
            
            b[pos] = (i == 0 && j == 0) ? c : " "
        }

    return b.join("");
};

let Solver = function (initboard) {
    let _this = {
        done: false,
        result: [],
        db: [{count:0, parent:null, b:initboard}], // 盘面记录
        stepboards: [[initboard]],  // idx手后的盘面情况
    };

    // 制作可以移动记录完毕的盘面的新盘面
    const move_all_blocks = function(id) {
        _this.db[id].b.split("").forEach((p, pos) => {
            if (_this.done || p == " " || p == "_")
                return;

            "udlr".split("").map(dir => {
                let b = move_piece(_this.db[id].b, pos, dir);
                if (b) append(b, id);
            });
        });
    };

    // 盘面未知的话添加到DB
    const append = function(b, parent) {
        let step = _this.db[parent].count + 1;

        // 2之前重复检查
        if (!_this.stepboards[step])
            _this.stepboards[step] = [];

        if (_this.stepboards.slice(-3).some(dbs0 => dbs0.indexOf(b) != -1))
            return;

        // 保存
        _this.db.push({b:b, count: step, parent:parent});
        _this.stepboards[step].push(b);

        if (b[3 * 4 + 1] == '4')
            goal();
    };

    // 找到解法, 根据前驱状态回溯, 得到解法
    const goal = function() {
        _this.done = true;
        let x = _this.db.pop();
        let ret = [];
        
        while (x.parent != null) {
            ret.push(x.b);
            x = _this.db[x.parent];
        }
        
        _this.result = ret.reverse();
    };

    // BFS, 每次处理1000个数据
    this.run = function(callback) {
        let pattern = 0;
        _this.done = false;
        const CUTOFF = 1000;

        const BFS = function() {
            for (var i = 0; i < CUTOFF; i++) {
                let checkid = pattern + i;
                move_all_blocks(checkid);

                if (_this.done)
                    return callback.success(_this.result);

                if (_this.db.length - 1 <= checkid)
                    return callback.fail();
            }

            pattern += i;
            callback.process(_this.db.slice(-1)[0].count, _this.db.length);
            setTimeout(BFS, 10);
        };

        BFS();
    };
};

const $id = (id) => document.getElementById(id);
const $name = (name) => document.getElementsByName(name);
const $c = (c) => document.getElementsByClassName(c);
const $q = (query) => document.querySelectorAll(query);

window.onload = () => {
    let board;

    // 绘制棋盘
    const printb = (b, scale) => {
        if (typeof(scale) == "undefined")
            scale = 10;
        
        if (scale == 0)
            // 将字符串转换成矩阵
            return [...Array(5)].map((v,i) => b.slice(i * 4, i * 4 + 4)).join("\n");
        
        return '<div class="board">' + b.split("").map((c, pos) => {
            if (c == "_" || c== " ")
                return "";
            
            var x0 = (pos % 4) * scale;
            var y0 = parseInt(pos / 4) * scale; // 每一个小方块位置
            
            var size = {
                1: {w:1, h:1, c:"#58f"},
                2: {w:2, h:1, c:"#ff5"},
                3: {w:1, h:2, c:"#5f8"},
                4: {w:2, h:2, c:"#f85"},
            }; // 每一种大小的方块对应的宽,高,颜色

            var h = size[c].h * scale;
            var w = size[c].w * scale;
            var style = ["height:" + h + "px"];
            style.push("width:" + w + "px");
            style.push("left:" + x0 + "px");
            style.push("top:" + y0 + "px");
            style.push("background-color:" + size[c].c);

            let $div = {};
            $div.style = style.join(";");
            $div.class = "piece";
            if (scale == 50) $div.id = "p" + pos.toString(10).padStart(2, "0");

            return '<div ' + Object.keys($div).map(key => key + '="' + $div[key] + '"').join(" ") + '></div>';
        }).join("") + "</div>"; // 绘制出盘面和方格
    };

    const goal = () => {
        $id("p13").innerHTML +=
            '<div style="position:absolute; width:100px; height:30px; top:30px; font-size:30px;transform:rotate(30deg);">'
            + 'WIN' + '</div>';
        $id("showsolve").style.display = "none";
    };
    
    const clickmove = function(e, $piece) {
        if ($piece == undefined)
            $piece = this;

        let pos = $piece.id.slice(1);
        let $dir = $piece.getElementsByClassName("selected")[0];
        if (!$dir) return;
        let cname = "udlr".split("").find(v => $dir.classList.contains(v));
        if (!cname) return;
        let tmp = move_piece(board, parseInt(pos, 10), cname);
        if (!tmp) return;

        board = tmp;
        update_board(board);
    };

    const addclickevents = function() {
        let $arrow = '<div class="l"></div><div class="r"></div>'
            + '<div class="u"></div><div class="d"></div>';
        
        [...$q("#inplay .piece")].map(($dom, idx) => {
            var y = parseInt($dom.style["top"]);
            var x = parseInt($dom.style["left"]);
            var pos = (x + y * 4) / 50;

            let movable = "udlr".split("").filter(dir => move_piece(board, pos, dir)); // 尝试每一个位置每个一方向
            if (movable.length == 0) return;

            $dom.innerHTML = $arrow;
            
            movable.map(v => {
                [...$dom.getElementsByClassName(v)].map($cdom => {
                    $cdom.style.display = "block";
                    $cdom.onclick = (e) => {
                        $cdom.classList.add("selected");
                        clickmove(e, $dom);
                    };
                });

            });
        });
    };

    const update_board = (b) => {
        $id("menu").style.display = "none";
        $id("showmenu").style.display = "inline-block";
        $id("inplay").style.display = "block";
        $id("inplay").innerHTML = printb(b, 50);

        if (board[13] == "4") return goal();
        addclickevents();
    };
    
    const load_quiz = (qid) => {
        board = qboards[qid];
        $id("solve").style.display = "none";
        update_board(board);

        $id("showsolve").style.display = "inline-block";

        $id("showsolve").onclick = function(e) {
            $id("solve").style.display = "block";
            $id("solve").innerHTML = ("<h2>分析中</h2><div id=solvelog></div>");
            $id("showsolve").style.display = "";
            var cal = new Solver(board);
            
            cal.run({
                success: (result) => {
                    $id("showsolve").style.display = "inline-block";
                    $id("solve").innerHTML =
                        "<h2>結果 (" + result.length + "手)</h2><div>"
                        + result.map(b => ("<div class='step'>" + printb(b) + "</div>")).join("")
                        +"</div>";
                },
                fail: () => { $id("solve").innerHTML = ("solution not found"); },
                process: (s, p) => {
                    $id("solvelog").innerText += (s +" steps, " + p + " patterns\n");
                },
            });
        };
    };

    const show_menu = function() {
        $id("menu").innerHTML = "<h2>所有关卡</h2>";
        qboards.forEach((b,i) => {
            let $div = document.createElement("div");
            $div.classList.add("option");
            $div.innerHTML = printb(b); // 棋盘画好后放入div
            $div.onclick = () => load_quiz(i); // 点击之后载入盘面
            $id("menu").appendChild($div); // 加入菜单中
        });

        // 点击关卡选择后先关闭选择标签
        $id("showmenu").onclick = () => {
            $id("showmenu").style.display = "none";
            $id("menu").style.display = "";
        };
    };

    show_menu();
};