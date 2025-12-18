/**
 * 부동산 경매 수익성 분석 앱 (UI Logic)
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('analysis-form');
    const resultSection = document.getElementById('result-section');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');

    // 숫자 포맷팅
    const numericInputs = document.querySelectorAll('.numeric-input');
    numericInputs.forEach(input => {
        formatAndSet(input);
        input.addEventListener('input', (e) => formatAndSet(e.target));
        input.addEventListener('focus', (e) => e.target.select()); // Auto-select on click
    });

    // 주소 입력 시 조정지역 자동 판단
    const addressInput = document.getElementById('address');
    const adjustmentAreaSelect = document.getElementById('is_adjustment_area');
    if (addressInput && adjustmentAreaSelect) {
        addressInput.addEventListener('input', function () {
            const currentAddress = this.value;
            let isAdjustment = false;
            for (const area of adjustmentAreas) {
                if (currentAddress.includes(area)) {
                    isAdjustment = true;
                    break;
                }
            }
            adjustmentAreaSelect.value = isAdjustment ? '예' : '아니오';
        });
    }

    // [UX] 낙찰가율 등 일반 입력 필드도 포커스 시 전체 선택
    const otherInputs = ['bid_rate', 'house_count', 'selling_years', 'loan_rate_percent', 'interest_rate_percent'];
    otherInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('focus', function () { this.select(); });
    });

    // 분석 실행
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Loader Start
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.style.display = 'flex';
            setTimeout(() => {
                runAnalysis();
                loader.style.display = 'none';

                // Result Scroll
                const res = document.getElementById('result-section');
                if (res && res.style.display !== 'none') {
                    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 800); // 0.8s fake delay
        } else {
            runAnalysis();
        }
    });

    // 파일 불러오기 이벤트
    const importInput = document.getElementById('import-file');
    if (importInput) {
        importInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data)) {
                        localStorage.setItem('auction_history', JSON.stringify(data));
                        loadHistoryList();
                        alert('히스토리를 성공적으로 불러왔습니다.');
                    } else {
                        alert('올바르지 않은 파일 형식입니다.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('파일을 읽는 중 오류가 발생했습니다.');
                }
                importInput.value = ''; // 초기화
            };
            reader.readAsText(file);
        });
    }

    // 초기 히스토리 로드
    loadHistoryList();

    // 초기화 버튼 바인딩 (New)
    if (typeof initResetButton === 'function') initResetButton();
});

function formatAndSet(element) {
    if (!element) return;
    let value = element.value.replace(/[^0-9]/g, '');
    if (value) {
        element.value = parseInt(value, 10).toLocaleString('ko-KR');
    } else {
        element.value = '';
    }
}

function safeFloat(val) {
    if (!val) return 0.0;
    return parseFloat(String(val).replace(/,/g, ''));
}

function safeInt(val) {
    if (!val) return 0;
    return parseInt(String(val).replace(/,/g, ''), 10);
}

// --- New Features Logic ---

// 1. 낙찰가율 조정 버튼 로직
// 1. 낙찰가율 조정 버튼 로직 (할인율 적용)
window.adjustBidRate = function (val) {
    const bidInput = document.getElementById('bid_rate');
    let current = parseFloat(bidInput.value) || 0;

    if (val === 100) {
        // [100%] 버튼
        bidInput.value = 100;
    } else if (val === -20) {
        // [▼20%] -> 20% 할인 (x 0.8)
        let newValue = current * 0.8;
        bidInput.value = parseFloat(newValue.toFixed(1));
    } else if (val === -30) {
        // [▼30%] -> 30% 할인 (x 0.7)
        let newValue = current * 0.7;
        bidInput.value = parseFloat(newValue.toFixed(1));
    }
};

// 2. 폼 초기화 로직
// 2. 폼 초기화 로직 (이벤트 리스너 바인딩 권장)
// 2. 폼 초기화 로직 (Global Export)
window.resetForm = function () {
    if (!confirm('모든 입력값을 초기화하시겠습니까?')) return;

    // 텍스트/숫자 입력 초기화
    document.querySelectorAll('input').forEach(input => {
        if (input.id === 'house_count' || input.id === 'tenant_status' || input.id === 'is_adjustment_area') return;
        input.value = '';
    });

    // 기본값 복원
    const defaults = {
        'bid_rate': 70,
        'interest_rate_percent': 5.0,
        'loan_rate_percent': 80.0,
        'brokerage_rate_percent': 0.4,
        'selling_years': 2,
        'deposit': '10,000,000',
        'monthly_rent': '500,000',
        'repair_cost': '3,000,000',
        'cleaning_cost': '350,000'
    };

    for (let id in defaults) {
        const el = document.getElementById(id);
        if (el) el.value = defaults[id];
    }

    // UI 업데이트 (옵션)
    // alert('초기화되었습니다.');
    // 결과 화면 숨김
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('initial-message').style.display = 'block';
};

// 3. 네이버 지도 링크 업데이트 로직
// 3. 지도 업데이트 로직 (구글 맵 임베드 + 네이버 링크)
function updateMapLink(address) {
    if (!address) return;

    // 괄호 및 괄호 안의 내용 제거
    const cleanedAddress = address.replace(/\([^)]*\)/g, '').trim();

    // 1) 네이버 지도 링크 업데이트
    const mapLink = document.getElementById('naver-map-link');
    const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(cleanedAddress)}`;
    if (mapLink) {
        mapLink.href = naverMapUrl;
    }

    // 2) 구글 지도 임베드 업데이트 (미리보기용)
    const mapEmbed = document.getElementById('google-map-embed');
    if (mapEmbed) {
        mapEmbed.src = `https://maps.google.com/maps?q=${encodeURIComponent(cleanedAddress)}&output=embed`;
    }
}
// --- End New Features Logic ---

function runAnalysis() {
    const c = new RealEstateAuctionCalculator();

    // 입력 값 매핑
    c.case_number = document.getElementById('case_number').value;
    c.appraisal_value = safeFloat(document.getElementById('appraisal_value').value);
    c.bid_rate = safeFloat(document.getElementById('bid_rate').value) / 100;
    c.tenant_status = document.getElementById('tenant_status').value;
    c.address = document.getElementById('address').value;
    c.public_price = safeFloat(document.getElementById('public_price').value);

    // 지도 링크 업데이트 (New)
    updateMapLink(c.address);

    let h_count_str = document.getElementById('house_count').value.replace('+', '');
    c.house_count = parseInt(h_count_str, 10) || 1;

    c.is_adjustment_area = (document.getElementById('is_adjustment_area').value === '예');

    c.interest_rate_percent = safeFloat(document.getElementById('interest_rate_percent').value);
    c.loan_rate_percent = safeFloat(document.getElementById('loan_rate_percent').value);
    c.brokerage_rate_percent = safeFloat(document.getElementById('brokerage_rate_percent').value);

    c.deposit = safeFloat(document.getElementById('deposit').value);
    c.monthly_rent = safeFloat(document.getElementById('monthly_rent').value);
    c.repair_cost = safeFloat(document.getElementById('repair_cost').value);
    c.cleaning_cost = safeFloat(document.getElementById('cleaning_cost').value);

    c.selling_price = safeFloat(document.getElementById('selling_price').value);
    const sy_input = document.getElementById('selling_years').value;
    c.selling_years = (sy_input === '' || sy_input === null) ? 2 : safeFloat(sy_input);

    // 계산 실행
    const purchase_price = c.calculate_purchase_price();
    const loan_amount = c.calculate_loan_amount();
    const total_cost = c.calculate_total_cost();
    const cash_needed = c.calculate_cash_needed();
    const monthly_interest = c.calculate_monthly_interest();

    const brokerage_fee = c.calculate_brokerage_fee();
    const three_month_interest = c.calculate_3month_interest();
    const registration_fee = c.calculate_registration_fee();

    const acq_tax_info = c.calculate_acquisition_tax();
    const cap_tax_info = c.calculate_capital_gains_tax();

    const roe = c.calculate_monthly_rent_yield();
    const { grade, comment, reason } = c.analyze_investment_value();

    const bid_rate_sim = c.calculate_by_bid_rates();
    const loan_rate_sim = c.calculate_by_loan_rates(); // [NEW] 대출 비율 시뮬레이션

    // 추천 낙찰가율
    let best_rate_info = null;
    if (bid_rate_sim) {
        const valid_sim = bid_rate_sim.filter(s => {
            const rate = parseFloat(s['낙찰가율']);
            return s['월세수익률'] !== -999 && rate >= 50 && rate <= 100;
        });
        if (valid_sim.length > 0) {
            best_rate_info = valid_sim.reduce((prev, current) => (prev['월세수익률'] > current['월세수익률']) ? prev : current);
        }
    }

    const monthly_net_income = c.monthly_rent - monthly_interest;
    const total_profit = (monthly_net_income * 12 * c.selling_years) + cap_tax_info['순이익'];
    const actual_investment = cash_needed - c.deposit;

    // 결과 객체 생성
    const results = {
        grade, comment, reason,
        purchase_price, total_cost, cash_needed, loan_amount, monthly_interest,
        acq_tax_total: acq_tax_info['총_취등록세'],
        acq_tax_note: acq_tax_info['예외조항'],
        cap_tax_total: cap_tax_info['총세금'],
        net_profit: cap_tax_info['순이익'],
        capital_gain: cap_tax_info['시세차익'],
        roe,
        bid_rate_sim,
        best_rate_info,
        brokerage_fee,
        three_month_interest,
        registration_fee,
        repair_and_cleaning_cost: c.repair_cost + c.cleaning_cost,
        actual_investment,
        monthly_net_income,
        total_profit,
        loan_rate_sim // [NEW]
    };

    // UI 업데이트
    updateUI(results, c);

    // 히스토리 저장
    saveHistory(c, results);
}

function updateUI(results, inputs) {
    document.getElementById('result-section').style.display = 'block';

    // 텍스트 필드 업데이트
    setText('res-case-number', inputs.case_number);
    setHtml('res-grade-badge', `${results.grade}등급`);
    document.getElementById('res-grade-badge').className = `grade-badge-lg bg-grade-${results.grade}`;
    setText('res-comment', `"${results.comment}"`);
    setHtml('res-reason', `${results.reason}<br>(실투자금: ${formatNum(results.actual_investment)}원)`);

    // [NEW] 상단 요약 추가 정보
    setText('res-loan-percent-summary', `${inputs.loan_rate_percent}%`);
    setText('t-is-regulated', inputs.is_adjustment_area ? '예 (규제지역)' : '아니오 (비규제)');

    // 추천 낙찰가율
    const bestRateDiv = document.getElementById('apply-best-rate');
    if (results.best_rate_info) {
        bestRateDiv.style.display = 'block';
        bestRateDiv.setAttribute('data-rate', results.best_rate_info['낙찰가율'].replace('%', ''));
        setHtml('res-best-rate-text', `낙찰가율 ${results.best_rate_info['낙찰가율']}`);
        setHtml('res-best-roe', `${results.best_rate_info['월세수익률'].toFixed(1)}%`);

        // 이벤트 리스너 재등록 방지 (간단하게 onclick 사용)
        bestRateDiv.onclick = function () {
            const rate = this.getAttribute('data-rate');
            const input = document.getElementById('bid_rate');
            input.value = rate;
            input.style.backgroundColor = '#d1e7dd';
            setTimeout(() => input.style.backgroundColor = '', 1500);
        };
    } else {
        bestRateDiv.style.display = 'none';
    }

    // 테이블 값 업데이트
    setText('t-case-number', inputs.case_number);
    setText('t-address', inputs.address);
    setText('t-appraisal', formatNum(inputs.appraisal_value));
    setText('t-bid-price', formatNum(results.purchase_price));
    setText('t-bid-rate', `(${inputs.bid_rate * 100}%)`);
    setText('t-rent-plan', `${formatNum(inputs.deposit)}/${formatNum(inputs.monthly_rent)}`);

    setText('t-acq-tax', formatNum(results.registration_fee));
    setText('t-brokerage', formatNum(results.brokerage_fee));
    setText('t-repair', formatNum(results.repair_and_cleaning_cost + results.three_month_interest));
    setText('t-total-cost', formatNum(results.total_cost));

    setText('t-loan', formatNum(results.loan_amount));
    setText('t-loan-rate', `(${inputs.loan_rate_percent}%)`);
    setText('t-deposit-return', formatNum(inputs.deposit));
    setText('t-actual-invest', formatNum(results.actual_investment));

    setText('t-monthly-rent', formatNum(inputs.monthly_rent));
    setText('t-monthly-interest', formatNum(results.monthly_interest));
    setText('t-interest-rate', `(${inputs.interest_rate_percent}%)`);
    setText('t-monthly-net', formatNum(results.monthly_net_income));
    setText('t-roe', `${results.roe.toFixed(2)}%`);

    setText('t-sell-price', formatNum(inputs.selling_price));
    setText('t-sell-years', `(${inputs.selling_years}년)`);
    setText('t-cap-tax', formatNum(results.cap_tax_total));
    setText('t-net-profit', formatNum(results.net_profit));

    // 시뮬레이션 테이블
    const simBody = document.getElementById('sim-table-body');
    simBody.innerHTML = '';
    results.bid_rate_sim.forEach(item => {
        const tr = document.createElement('tr');
        if (item['낙찰가율'] === `${inputs.bid_rate * 100}%`) {
            tr.style.backgroundColor = '#e8f5e9';
            tr.style.fontWeight = 'bold';
            tr.style.border = '2px solid #28a745';
        }

        tr.innerHTML = `
            <td>${item['낙찰가율']}</td>
            <td><span class="badge bg-grade-${item['등급']}">${item['등급']}</span></td>
            <td>${formatNum(item['낙찰가'] / 10000)}만</td>
            <td>${formatNum(item['필요현금'] / 10000)}만</td>
            <td style="font-weight: bold; color: #d63384;">${item['월세수익률'].toFixed(1)}%</td>
        `;
        simBody.appendChild(tr);
    });

    // 차트 렌더링
    renderCharts(results, inputs);

    // PDF 버튼 데이터 설정
    const pdfBtn = document.getElementById('pdf-export-btn');
    pdfBtn.dataset.grade = results.grade;
    pdfBtn.dataset.address = inputs.address;
    pdfBtn.dataset.casenum = inputs.case_number;
    pdfBtn.dataset.roe = results.roe.toFixed(1);

    // PDF 버튼 이벤트
    pdfBtn.onclick = function () {
        exportPDF(this);
    };

    // 복사 버튼 이벤트
    document.getElementById('copy-report-btn').onclick = function () {
        copyReport(this);
    };
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function formatNum(num) {
    if (num === Infinity) return '무한대 (Plus PI)';
    if (num === -Infinity) return '손실 (이자과다)';
    if (!num && num !== 0) return '0';
    return Math.round(num).toLocaleString('ko-KR');
}

// --- 차트 관련 ---
let gradeChart = null;
let simChart = null;
let loanChart = null; // [NEW]

function renderCharts(results, inputs) {
    const simDataRaw = results.bid_rate_sim;

    // [Helper] 수익률 클램핑
    const clampRoe = (val) => {
        if (val === Infinity || val === 'Infinity') return 200;
        if (val === -Infinity || val === '-Infinity') return -200;

        // 숫자형 클램핑 (차트 범위 이탈 방지)
        const num = parseFloat(val);
        if (num >= 200) return 200;
        if (num <= -200) return -200;

        return num;
    };
    // [Helper] 툴팁 라벨
    const tooltipLabel = (context) => {
        let label = context.dataset.label || '';
        if (label) label += ': ';
        let val = context.raw?.y ?? context.parsed?.y ?? context.parsed;
        // 바차트는 context.parsed 사용, Scatter는 context.parsed.y 사용

        if (val >= 200) return label + "무한대 (Plus PI)";
        if (val <= -200) return label + "손실 (이자과다)";
        return label + (val.toFixed ? val.toFixed(1) : val) + '%';
    };

    // 1. 등급 시뮬레이션 차트
    const gradeCtx = document.getElementById('gradeSimulationChart');
    if (gradeChart) gradeChart.destroy();

    const gradeColors = { 'S': 'red', 'A': 'orange', 'B': 'green', 'C': 'blue', 'F': 'darkgrey' };
    const datasets = Object.keys(gradeColors).map(grade => {
        const gradeData = simDataRaw.filter(d => d['등급'] === grade && d['월세수익률'] > -999);
        return {
            label: `등급 ${grade}`,
            data: gradeData.map(d => ({ x: parseFloat(d['낙찰가율']), y: clampRoe(d['월세수익률']) })),
            backgroundColor: gradeColors[grade],
            type: 'scatter',
            pointRadius: 6,
            pointHoverRadius: 8
        };
    });

    datasets.push({
        label: '수익률 추이',
        data: simDataRaw.filter(d => d['월세수익률'] > -999).map(d => ({ x: parseFloat(d['낙찰가율']), y: clampRoe(d['월세수익률']) })),
        type: 'line',
        borderColor: 'rgba(0, 0, 0, 0.2)',
        fill: false,
        tension: 0.1,
        pointRadius: 0
    });

    datasets.push({
        label: '현재 선택',
        data: [{ x: inputs.bid_rate * 100, y: clampRoe(results.roe) }],
        type: 'scatter',
        pointStyle: 'rectRot', // 다이아몬드 회전
        backgroundColor: '#000000ff', // 딥 핑크 (Neon Style)
        borderColor: '#eff30bff', // 흰색 테두리 (고대비)
        borderWidth: 3,
        radius: 12, // 기본 크기 증가
        hoverRadius: 20, // 호버 시 축소 방지 (더 커짐)
        // [New] 반짝이는(Pulse) 애니메이션 효과
        animations: {
            radius: {
                duration: 1000,
                easing: 'easeInOutQuad',
                loop: true,
                from: 10,
                to: 16
            }
        }
    });

    gradeChart = new Chart(gradeCtx, {
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: tooltipLabel
                    }
                }
            },
            scales: {
                x: { type: 'linear', title: { display: true, text: '낙찰가율 (%)' } },
                y: { title: { display: true, text: '월세수익률 (ROE, %)' } }
            }
        }
    });

    // 2. 수익률/실투자금 차트
    const simCtx = document.getElementById('simulationChart');
    if (simChart) simChart.destroy();

    simChart = new Chart(simCtx, {
        type: 'line',
        data: {
            labels: simDataRaw.map(d => d['낙찰가율']),
            datasets: [
                {
                    label: '수익률 (%)',
                    data: simDataRaw.map(d => clampRoe(d['월세수익률'])),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    yAxisID: 'y',
                    tension: 0.1
                },
                {
                    label: '실투자금 (만원)',
                    data: simDataRaw.map(d => d['필요현금'] > 0 ? d['필요현금'] / 10000 : 0),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    yAxisID: 'y1',
                    tension: 0.1
                }
            ]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.yAxisID === 'y1') {
                                return context.dataset.label + ': ' + Math.round(context.raw).toLocaleString() + '만원';
                            }
                            return tooltipLabel(context);
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '수익률 (%)' } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: '실투자금 (만원)' }, grid: { drawOnChartArea: false } }
            }
        }
    });

    // 3. [NEW] 대출 비율별 수익률 차트
    const loanCtx = document.getElementById('loanRateSimulationChart');
    if (loanChart) loanChart.destroy();

    const loanDataRaw = results.loan_rate_sim;
    loanChart = new Chart(loanCtx, {
        type: 'line',
        data: {
            labels: loanDataRaw.map(d => `${d['대출비율']}%`),
            datasets: [
                {
                    label: '수익률 (%)',
                    data: loanDataRaw.map(d => clampRoe(d['수익률'])),
                    borderColor: '#4bc0c0', // Green-ish
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: { display: true, text: '수익률 (%)' },
                    suggestedMin: 0,
                    suggestedMax: 50
                },
                x: {
                    title: { display: true, text: '대출 이자율 아님, 대출 한도 비율(LTV) %' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: tooltipLabel
                    }
                },
                title: {
                    display: true,
                    text: '대출 비율(LTV) 변화에 따른 수익률 감도'
                }
            }
        }
    });
}

// --- 히스토리 관리 ---
function saveHistory(inputs, results) {
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        case_number: inputs.case_number,
        address: inputs.address,
        bid_rate: inputs.bid_rate * 100,
        purchase_price: results.purchase_price,
        roe: (results.roe === Infinity || results.roe === -Infinity) ? String(results.roe) : results.roe,
        net_profit: results.net_profit,
        inputs: {
            ...inputs, // 객체 복사
        },
        results: results
    };

    let history = JSON.parse(localStorage.getItem('auction_history') || '[]');
    history.unshift(historyItem); // 최신순
    localStorage.setItem('auction_history', JSON.stringify(history));

    loadHistoryList();
}

function loadHistoryList() {
    const listEl = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('auction_history') || '[]');

    listEl.innerHTML = '';
    if (history.length === 0) {
        listEl.innerHTML = '<li class="list-group-item text-center text-muted">저장된 기록이 없습니다.</li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <div class="fw-bold">${item.case_number} <span class="badge bg-secondary ms-2">${item.timestamp}</span></div>
                <small>${item.address}</small><br>
                <small class="text-muted">낙찰가: ${formatNum(item.purchase_price)}원 | ROE: ${formatNum(Number(item.roe))}%</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="loadHistoryItem(${item.id})">불러오기</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryItem(${item.id})">삭제</button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

window.loadHistoryItem = function (id) {
    const history = JSON.parse(localStorage.getItem('auction_history') || '[]');
    const item = history.find(h => h.id === id);
    if (!item) return;

    const inputs = item.inputs;

    // 폼 채우기
    document.getElementById('case_number').value = inputs.case_number;
    document.getElementById('appraisal_value').value = formatNum(inputs.appraisal_value);
    document.getElementById('bid_rate').value = (inputs.bid_rate * 100).toFixed(1);

    document.getElementById('tenant_status').value = inputs.tenant_status;
    document.getElementById('address').value = inputs.address;
    document.getElementById('public_price').value = formatNum(inputs.public_price);

    document.getElementById('house_count').value = inputs.house_count;
    document.getElementById('is_adjustment_area').value = inputs.is_adjustment_area ? '예' : '아니오';

    document.getElementById('interest_rate_percent').value = inputs.interest_rate_percent;
    document.getElementById('loan_rate_percent').value = inputs.loan_rate_percent;
    document.getElementById('brokerage_rate_percent').value = inputs.brokerage_rate_percent;

    document.getElementById('deposit').value = formatNum(inputs.deposit);
    document.getElementById('monthly_rent').value = formatNum(inputs.monthly_rent);
    document.getElementById('repair_cost').value = formatNum(inputs.repair_cost);
    document.getElementById('cleaning_cost').value = formatNum(inputs.cleaning_cost);

    document.getElementById('selling_price').value = formatNum(inputs.selling_price);
    document.getElementById('selling_years').value = inputs.selling_years;

    // 분석 실행
    runAnalysis();

    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('historyModal'));
    if (modal) modal.hide();
};

window.deleteHistoryItem = function (id) {
    // if (!confirm('정말 삭제하시겠습니까?')) return; // UX 요청으로 확인창 제거
    let history = JSON.parse(localStorage.getItem('auction_history') || '[]');
    history = history.filter(h => h.id !== id);
    localStorage.setItem('auction_history', JSON.stringify(history));
    loadHistoryList();
};

window.clearHistory = function () {
    // if (!confirm('모든 히스토리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return; // UX 요청으로 확인창 제거
    localStorage.removeItem('auction_history');
    loadHistoryList();
};

window.exportHistory = function () {
    const history = localStorage.getItem('auction_history');
    if (!history) {
        alert('저장된 히스토리가 없습니다.');
        return;
    }

    const blob = new Blob([history], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auction_history_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// --- 유틸리티 ---
function exportPDF(btn) {
    const element = document.getElementById('pdf-export-area');
    const grade = btn.dataset.grade;
    const address = btn.dataset.address.split(' ')[0];
    const caseNum = btn.dataset.casenum.replace(/[\/\\]/g, '-');
    const roe = btn.dataset.roe;
    const fileName = `[${grade}등급] ${address}_${caseNum}+${roe}%.pdf`;

    const opt = {
        margin: [15, 10, 15, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        enableLinks: true
    };

    html2pdf().from(element).set(opt).save();
}

function copyReport(btn) {
    try {
        let text = "";

        // 1. Top Section (Grade, Comment, Case, Reason)
        const gradeBadge = document.getElementById('res-grade-badge');
        const comment = document.getElementById('res-comment');
        const caseNum = document.getElementById('res-case-number');
        const reason = document.getElementById('res-reason');

        if (gradeBadge) text += `${gradeBadge.innerText.trim()}\n`;
        if (comment) text += `"${comment.innerText.trim()}"\n`;
        if (caseNum) text += `물건번호: ${caseNum.innerText.trim()}\n`;
        if (reason) text += `AI 판단: ${reason.innerText.trim()}\n`;

        // Recommendation (Split into 3 lines)
        const bestRateDiv = document.getElementById('apply-best-rate');
        if (bestRateDiv && bestRateDiv.style.display !== 'none') {
            const bestRate = document.getElementById('res-best-rate-text').innerText.trim();
            const bestRoe = document.getElementById('res-best-roe').innerText.trim();
            text += `추천\n`;
            text += `낙찰가율 ${bestRate}일 때\n`;
            text += `ROE ${bestRoe} 달성 가능\n`;
        }

        // 2. Main Sections (Iterate all report-sections)
        // Select all report sections in the export area
        // Note: We must exclude any that are inside .no-copy (like simulation graphs)
        const exportArea = document.getElementById('pdf-export-area');
        const sections = exportArea.querySelectorAll('.report-section');

        sections.forEach(section => {
            // Check if section is hidden or part of no-copy
            if (section.offsetParent === null) return;
            if (section.closest('.no-copy')) return;

            // Extra spacing before each section
            text += `\n\n\n`; // Generous spacing

            // Title and Separator
            const titleEl = section.querySelector('.report-section-title');
            if (titleEl) {
                // Determine title text (handle spans or icons inside)
                let titleText = titleEl.innerText.trim();
                text += `${titleText}\n`;
                text += `--------------------------------------------------------------------------------\n`;
            }

            // Content Type A: Data Table (Overview)
            const table = section.querySelector('table');
            if (table) {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const th = row.querySelector('th');
                    const td = row.querySelector('td');
                    if (th && td) { // Ignore map row or others without th/td pair
                        text += `${th.innerText.trim()} : ${td.innerText.trim()}\n`;
                    }
                });
            }

            // Content Type B: Summary Items (Costs, Profit, etc)
            const summaryItems = section.querySelectorAll('.summary-item');
            if (summaryItems.length > 0) {
                summaryItems.forEach(item => {
                    const label = item.querySelector('.summary-label').innerText.trim();
                    const value = item.querySelector('.summary-value').innerText.trim();
                    text += `${label} : ${value}\n`;
                });
            }

            // Footer Separator
            text += `============================================`;
        });

        // Execute Copy
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i> 복사됨';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });

    } catch (err) {
        console.error('복사 생성 중 오류:', err);
        alert('복사 처리 중 오류가 발생했습니다.');
    }
}
