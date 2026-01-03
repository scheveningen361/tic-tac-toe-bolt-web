// Vanishing TicTacToe Solver - JavaScript port of think2.py

const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
];

const TERM_O = [null, null, "O"];  // O to move but already lost
const TERM_X = [null, null, "X"];  // X to move but already lost

function hasWin(q) {
    if (q.length < 3) {
        return false;
    }
    const s = new Set(q);
    for (const [a, b, c] of WIN_LINES) {
        if (s.has(a) && s.has(b) && s.has(c)) {
            return true;
        }
    }
    return false;
}

function legalMoves(o, x) {
    const occ = new Set([...o, ...x]);
    const moves = [];
    for (let p = 0; p < 9; p++) {
        if (!occ.has(p)) {
            moves.push(p);
        }
    }
    return moves;
}

function applyMove(state, move) {
    const [o, x, turn] = state;
    if (o === null || x === null) {
        throw new Error("Cannot move from a terminal state.");
    }

    const occ = new Set([...o, ...x]);
    if (occ.has(move)) {
        throw new Error("Illegal move: occupied");
    }

    if (turn === "O") {
        let no = [...o, move];
        if (no.length > 3) {
            no = no.slice(1);
        }
        if (hasWin(no)) {
            return TERM_X;
        }
        return [no, x, "X"];
    }

    if (turn === "X") {
        let nx = [...x, move];
        if (nx.length > 3) {
            nx = nx.slice(1);
        }
        if (hasWin(nx)) {
            return TERM_O;
        }
        return [o, nx, "O"];
    }

    throw new Error("turn must be 'O' or 'X'");
}

function winnerFromTerminal(state) {
    const [o, x, turn] = state;
    if (o !== null) {
        return null;
    }
    // terminal: player to move has already lost
    return turn === "X" ? "O" : "X";
}

// Simple deque implementation
class Deque {
    constructor() {
        this.items = [];
    }
    append(item) {
        this.items.push(item);
    }
    popleft() {
        return this.items.shift();
    }
    get length() {
        return this.items.length;
    }
}

// DefaultDict implementation
class DefaultDict extends Map {
    constructor(defaultFactory) {
        super();
        this.defaultFactory = defaultFactory;
    }
    get(key) {
        if (!this.has(key)) {
            this.set(key, this.defaultFactory());
        }
        return super.get(key);
    }
}

class DisappearingTicTacToeSolver {
    /**
     * 결과값(현재 차례 기준):
     *   +1 = WIN  (완벽하게 두면 이김)
     *    0 = DRAW (완벽하게 두면 영원히 안 끝나게 만들 수 있음)
     *   -1 = LOSS (완벽하게 두면 짐)
     * 
     * distance[state]:
     *   - terminal: 0
     *   - WIN/LOSS: (해당 상태에서 지금부터 몇 ply 후 게임 종료)  [양쪽 착수 포함]
     *   - DRAW: None
     */
    constructor() {
        this.starts = [[[], [], "O"], [[], [], "X"]];
        this.succs = new DefaultDict(() => []);
        this.preds = new DefaultDict(() => []);
        this.result = new Map();
        this.distance = new Map();

        this._buildGraph();
        this._solveOutcomes();
        this._solveDistances();
    }

    _buildGraph() {
        const seen = new Set();
        const termOKey = this._stateKey(TERM_O);
        const termXKey = this._stateKey(TERM_X);
        seen.add(termOKey);
        seen.add(termXKey);
        const q = new Deque();

        for (const s of this.starts) {
            const key = this._stateKey(s);
            seen.add(key);
            q.append(s);
        }

        let iterations = 0;
        const MAX_ITERATIONS = 100000; // Safety limit

        // BFS로 "도달 가능한 상태"만 생성(최적화)
        while (q.length > 0) {
            iterations++;
            if (iterations > MAX_ITERATIONS) {
                console.warn('Graph building reached max iterations, stopping');
                break;
            }

            const s = q.popleft();
            const [o, x, turn] = s;
            if (o === null) {
                continue;
            }

            try {
                for (const mv of legalMoves(o, x)) {
                    const t = applyMove(s, mv);
                    const sKey = this._stateKey(s);
                    const tKey = this._stateKey(t);
                    
                    // Store state objects, not keys
                    this.succs.get(sKey).push(t);
                    this.preds.get(tKey).push(s);
                    
                    if (!seen.has(tKey) && tKey !== termOKey && tKey !== termXKey) {
                        seen.add(tKey);
                        q.append(t);
                    }
                }
            } catch (error) {
                console.error('Error in _buildGraph:', error, 'state:', s);
                throw error;
            }
        }

        console.log(`Graph built: ${seen.size} states, ${iterations} iterations`);

        // terminal 노드 보장
        this.succs.get(termOKey);
        this.succs.get(termXKey);
        this.preds.get(termOKey);
        this.preds.get(termXKey);
    }

    _solveOutcomes() {
        const UNKNOWN = 2;
        for (const sKey of this.succs.keys()) {
            this.result.set(sKey, UNKNOWN);
        }

        const termOKey = this._stateKey(TERM_O);
        const termXKey = this._stateKey(TERM_X);
        
        // terminal: player to move already lost
        this.result.set(termOKey, -1);
        this.result.set(termXKey, -1);

        const remaining = new Map();
        for (const sKey of this.succs.keys()) {
            remaining.set(sKey, this.succs.get(sKey).length);
        }

        const dq = new Deque();
        dq.append(TERM_O);
        dq.append(TERM_X);

        while (dq.length > 0) {
            const s = dq.popleft();
            const sKey = this._stateKey(s);
            const rs = this.result.get(sKey);

            const preds = this.preds.get(sKey) || [];
            for (const p of preds) {
                const pKey = this._stateKey(p);
                if (this.result.get(pKey) !== UNKNOWN) {
                    continue;
                }

                if (rs === -1) {
                    // successor is LOSS for player-to-move => predecessor is WIN
                    this.result.set(pKey, 1);
                    dq.append(p);
                } else {
                    // successor is WIN => count down; if all successors are WIN => predecessor is LOSS
                    const rem = remaining.get(pKey) - 1;
                    remaining.set(pKey, rem);
                    if (rem === 0) {
                        this.result.set(pKey, -1);
                        dq.append(p);
                    }
                }
            }
        }

        // unresolved => draw (cycles / infinite play possible)
        for (const sKey of this.result.keys()) {
            if (this.result.get(sKey) === UNKNOWN) {
                this.result.set(sKey, 0);
            }
        }
    }

    _solveDistances() {
        /**
         * 사이클이 있어도 일관되게 '몇 ply 후 종료'를 계산.
         * - WIN 상태: (이기는 쪽) 최대한 빨리 끝냄  -> 1 + min(LOSS 자식의 dist)
         * - LOSS 상태: (지는 쪽) 최대한 늦게 끝남  -> 1 + max(WIN  자식의 dist)
         * - DRAW 상태: None
         * - terminal: 0
         * 
         * 핵심: DFS + cycle-guard로 끊지 말고, Bellman식 고정점으로 dist를 수렴시킨다.
         */

        const dist = new Map();
        for (const [sKey, r] of this.result.entries()) {
            if (sKey === this._stateKey(TERM_O) || sKey === this._stateKey(TERM_X)) {
                dist.set(sKey, 0);
            } else if (r === 0) {
                dist.set(sKey, null);
            } else {
                dist.set(sKey, 0);  // 하한에서 시작(0) -> 단조 증가하며 수렴
            }
        }

        const candidate = (sKey) => {
            const r = this.result.get(sKey);
            if (r === 1) {
                // WIN: LOSS로 보내는 수들 중 가장 빨리 끝나는 것
                const vals = [];
                for (const t of this.succs.get(sKey)) {
                    const tKey = this._stateKey(t);
                    if (this.result.get(tKey) === -1) {
                        const dt = dist.get(tKey);
                        if (dt !== null && dt !== undefined) {
                            vals.push(dt);
                        }
                    }
                }
                if (vals.length === 0) {
                    return null;
                }
                return 1 + Math.min(...vals);
            }

            if (r === -1) {
                // LOSS: WIN으로 가는 수들 중 가장 늦게 끝나는 것
                const vals = [];
                for (const t of this.succs.get(sKey)) {
                    const tKey = this._stateKey(t);
                    if (this.result.get(tKey) === 1) {
                        const dt = dist.get(tKey);
                        if (dt !== null && dt !== undefined) {
                            vals.push(dt);
                        }
                    }
                }
                if (vals.length === 0) {
                    return null;
                }
                return 1 + Math.max(...vals);
            }

            return null;  // DRAW
        };

        // 변경된 값만 전파(최적화)
        const q = new Deque();
        const inq = new Set();
        const termOKey = this._stateKey(TERM_O);
        const termXKey = this._stateKey(TERM_X);
        
        for (const [sKey, r] of this.result.entries()) {
            if (r !== 0 && sKey !== termOKey && sKey !== termXKey) {
                q.append(sKey);
                inq.add(sKey);
            }
        }

        while (q.length > 0) {
            const sKey = q.popleft();
            inq.delete(sKey);

            const newVal = candidate(sKey);
            if (newVal === null) {
                continue;
            }

            const cur = dist.get(sKey);
            // dist는 단조 증가 방향으로만 갱신되므로 안전하게 "더 커질 때만" 업데이트
            if (cur === null || cur === undefined || newVal > cur) {
                dist.set(sKey, newVal);
                // dist[sKey]가 커지면, 이를 참조하는 predecessor들도 커질 수 있음
                const preds = this.preds.get(sKey) || [];
                for (const p of preds) {
                    const pKey = this._stateKey(p);
                    if (pKey === termOKey || pKey === termXKey) {
                        continue;
                    }
                    if (this.result.get(pKey) === 0) {
                        continue;
                    }
                    if (!inq.has(pKey)) {
                        q.append(pKey);
                        inq.add(pKey);
                    }
                }
            }
        }

        this.distance = dist;
    }

    _stateKey(state) {
        // Convert state to string key for Map
        const [o, x, turn] = state;
        // Handle null, empty array, and array cases
        let oStr;
        if (o === null) {
            oStr = 'null';
        } else if (Array.isArray(o) && o.length === 0) {
            oStr = '';
        } else if (Array.isArray(o)) {
            oStr = o.join(',');
        } else {
            oStr = String(o);
        }
        
        let xStr;
        if (x === null) {
            xStr = 'null';
        } else if (Array.isArray(x) && x.length === 0) {
            xStr = '';
        } else if (Array.isArray(x)) {
            xStr = x.join(',');
        } else {
            xStr = String(x);
        }
        
        return `${oStr}|${xStr}|${turn}`;
    }

    _parseStateKey(key) {
        // Parse state key back to state
        const [oStr, xStr, turn] = key.split('|');
        const o = oStr === 'null' ? null : oStr ? oStr.split(',').map(Number) : [];
        const x = xStr === 'null' ? null : xStr ? xStr.split(',').map(Number) : [];
        return [o, x, turn];
    }

    evaluate(state) {
        const key = this._stateKey(state);
        if (!this.result.has(key)) {
            throw new Error("State not found (maybe not reachable from empty start).");
        }
        return this.result.get(key);
    }

    distanceToEnd(state) {
        const key = this._stateKey(state);
        if (!this.distance.has(key)) {
            throw new Error("State not found.");
        }
        return this.distance.get(key);
    }

    static outcomeText(v) {
        return {1: "WIN", 0: "DRAW", "-1": "LOSS"}[v] || "UNKNOWN";
    }

    bestMove(state) {
        /**
         * 사용자 정의 '최선':
         *   - 이길 수 있으면 가장 빨리 이기는 수
         *   - 질 수밖에 없으면 가장 늦게 지는 수
         *   - DRAW이면 DRAW 유지 수(없으면 아무거나)
         */
        const [o, x, turn] = state;
        if (o === null) {
            return null;
        }

        const key = this._stateKey(state);
        const r = this.result.get(key);
        const moves = legalMoves(o, x);
        if (moves.length === 0) {
            return null;
        }

        let bestMv = null;
        let bestKey = null;

        for (const mv of moves) {
            const t = applyMove(state, mv);

            // 이 수 자체로 즉시 승리(terminal)면 가장 빠름 => ply=1
            if (this._stateKey(t) === this._stateKey(TERM_O) || this._stateKey(t) === this._stateKey(TERM_X)) {
                const key = [0, 1];  // (우선순위, ply)
                if (bestKey === null || this._compareKeys(key, bestKey) < 0) {
                    bestKey = key;
                    bestMv = mv;
                }
                continue;
            }

            const tKey = this._stateKey(t);
            const rt = this.result.get(tKey);
            const dt = this.distance.get(tKey);  // None이면 DRAW

            let moveKey;
            if (r === 1) {
                // 현재 필승: 상대가 필패가 되는 수 중, 총 종료 ply 최소
                if (rt === -1 && dt !== null && dt !== undefined) {
                    moveKey = [0, 1 + dt];
                } else {
                    moveKey = [1, 10**9];  // fallback
                }
            } else if (r === -1) {
                // 현재 필패: 상대가 필승인 수들 중, 총 종료 ply 최대
                if (rt === 1 && dt !== null && dt !== undefined) {
                    moveKey = [0, -(1 + dt)];  // 최대화 => 음수로 최소화
                } else {
                    moveKey = [1, 0];
                }
            } else {
                // DRAW: DRAW로 가는 수 우선
                if (rt === 0) {
                    moveKey = [0, 0];
                } else {
                    moveKey = [1, 0];
                }
            }

            if (bestKey === null || this._compareKeys(moveKey, bestKey) < 0) {
                bestKey = moveKey;
                bestMv = mv;
            }
        }

        return bestMv;
    }

    _compareKeys(key1, key2) {
        // Compare keys: [priority, value]
        if (key1[0] !== key2[0]) {
            return key1[0] - key2[0];
        }
        return key1[1] - key2[1];
    }

    getBestMoves(state) {
        /**
         * 최선의 수가 여러 개일 때 모두 반환 (무작위 선택용)
         */
        const [o, x, turn] = state;
        if (o === null) {
            return [];
        }

        const key = this._stateKey(state);
        const r = this.result.get(key);
        const moves = legalMoves(o, x);
        if (moves.length === 0) {
            return [];
        }

        const bestMoves = [];
        let bestKey = null;

        for (const mv of moves) {
            const t = applyMove(state, mv);

            // 이 수 자체로 즉시 승리(terminal)면 가장 빠름 => ply=1
            if (this._stateKey(t) === this._stateKey(TERM_O) || this._stateKey(t) === this._stateKey(TERM_X)) {
                const moveKey = [0, 1];
                if (bestKey === null || this._compareKeys(moveKey, bestKey) < 0) {
                    bestKey = moveKey;
                    bestMoves.length = 0;
                    bestMoves.push(mv);
                } else if (this._compareKeys(moveKey, bestKey) === 0) {
                    bestMoves.push(mv);
                }
                continue;
            }

            const tKey = this._stateKey(t);
            const rt = this.result.get(tKey);
            const dt = this.distance.get(tKey);

            let moveKey;
            if (r === 1) {
                if (rt === -1 && dt !== null && dt !== undefined) {
                    moveKey = [0, 1 + dt];
                } else {
                    moveKey = [1, 10**9];
                }
            } else if (r === -1) {
                if (rt === 1 && dt !== null && dt !== undefined) {
                    moveKey = [0, -(1 + dt)];
                } else {
                    moveKey = [1, 0];
                }
            } else {
                if (rt === 0) {
                    moveKey = [0, 0];
                } else {
                    moveKey = [1, 0];
                }
            }

            if (bestKey === null || this._compareKeys(moveKey, bestKey) < 0) {
                bestKey = moveKey;
                bestMoves.length = 0;
                bestMoves.push(mv);
            } else if (this._compareKeys(moveKey, bestKey) === 0) {
                bestMoves.push(mv);
            }
        }

        return bestMoves;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DisappearingTicTacToeSolver,
        applyMove,
        legalMoves,
        hasWin,
        TERM_O,
        TERM_X
    };
}

