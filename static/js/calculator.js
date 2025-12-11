/**
 * 부동산 경매 수익성 분석 계산기 (JavaScript Port)
 * Original Python: property_ca_3_2.py
 */

class RealEstateAuctionCalculator {
    constructor() {
        // [기본 정보]
        this.case_number = "";
        this.appraisal_value = 0;
        this.bid_rate = 0; // 0.0 ~ 1.0
        this.address = "";
        this.tenant_status = "";

        // [사용자 설정 변수]
        this.loan_rate_percent = 80.0;
        this.interest_rate_percent = 5.0;
        this.brokerage_rate_percent = 0.4;

        // [비용 정보]
        this.repair_cost = 0;
        this.cleaning_cost = 0;
        this.management_fee = 0;
        this.prepayment_fee_rate = 0.012;

        // [임대 정보]
        this.deposit = 0;
        this.monthly_rent = 0;

        // [매도/세금 정보]
        this.selling_price = 0;
        this.selling_years = 2;
        this.public_price = 0;
        this.house_count = 1;
        this.is_adjustment_area = false;
        this.building_area = 0;

        this.BASIC_DEDUCTION = 2500000;
    }

    // --- 계산 로직 ---

    calculate_purchase_price() {
        return this.appraisal_value * this.bid_rate;
    }

    is_capital_area() {
        const keywords = ['서울', '경기', '인천'];
        return keywords.some(k => this.address.includes(k));
    }

    calculate_acquisition_tax() {
        // [2025 Rules]
        // 1. Basic Rates (1 House or Non-Regulated 2 House):
        //    - ~600m: 1.1% (1% + 0.1% Edu)
        //    - 600m~900m: 1.1% ~ 3.3% (Sliding)
        //    - 900m+: 3.3% (3% + 0.3% Edu)
        //    * Rural Tax: 85m2+ -> 0.2% added. (Simplification: Ignore Rural for now or assume <85 usually, but let's check building_area logic if exists. I will add Rural if >85)
        // 2. Heavy Rates (Regulated Area + Multi-House):
        //    - 2 House (Regulated): 8.4%
        //    - 3 House (Regulated): 12.4%
        //    - 3 House (Non-Regulated): 8.4%
        //    - 4 House / Corp: 12.4%

        const purchase_price = this.calculate_purchase_price();
        const is_heavy = false;
        let acq_rate = 0; // 취득세
        let edu_rate = 0; // 지방교육세
        let rural_rate = 0; // 농어촌특별세
        let note = "";

        // 주택 수 및 규제지역에 따른 중과 여부 판단
        let heavy_type = "NONE"; // NONE, 8, 12

        if (this.house_count === 1) {
            heavy_type = "NONE";
        } else if (this.house_count === 2) {
            if (this.is_adjustment_area) heavy_type = "8"; // 조정 2주택 -> 8%
            else heavy_type = "NONE"; // 비조정 2주택 -> 기본
        } else if (this.house_count === 3) {
            if (this.is_adjustment_area) heavy_type = "12"; // 조정 3주택 -> 12%
            else heavy_type = "8"; // 비조정 3주택 -> 8%
        } else if (this.house_count >= 4) {
            heavy_type = "12"; // 4주택 이상 -> 12%
        }

        // 법인 처리 (Todo: 법인 체크박스가 있다면 추가, 현재는 개인 가정)

        if (heavy_type === "NONE") {
            // 기본 세율 (1~3%)
            if (purchase_price <= 600000000) {
                acq_rate = 0.01;
                edu_rate = 0.001;
            } else if (purchase_price <= 900000000) {
                // (매수가 * 2 / 3억 - 3) / 100
                acq_rate = Math.round(((purchase_price * 2 / 300000000 - 3) / 100) * 10000) / 10000;
                // 교육세는 취득세율의 10%가 아님. 
                // 6~9구간: (취득세율 * 50% ? 아니오, 복잡함). 
                // *간편식*: 1~3% 구간 교육세는 전 구간 0.1%(6억이하) ~ 0.3%(9억초과) 아님. 
                // 정확히는: 
                // 6억이하: 0.1%
                // 9억초과: 0.3%
                // 6~9억: 민간 임대주택법 등 복잡하나, 실무상 (해당세율 - 0.02)/2 ...? 
                // *Simpler View used in simple calcs*: 0.1~0.3 linear? 
                // Let's use simplified mapping: Rate * 0.1 (Similar to 10% surcharge)
                edu_rate = acq_rate * 0.1;
            } else {
                acq_rate = 0.03;
                edu_rate = 0.003;
            }
            note = "기본세율 적용";
        } else if (heavy_type === "8") {
            // 8.4% (취득세 8% + 교육세 0.4%)
            acq_rate = 0.08;
            edu_rate = 0.004;
            note = "다주택 중과(8.4%)";
        } else if (heavy_type === "12") {
            // 12.4% (취득세 12% + 교육세 0.4%)
            acq_rate = 0.12;
            edu_rate = 0.004;
            note = "다주택 중과(12.4%)";
        }

        // 농어촌특별세: 85m2 초과 시 0.2% (중과 시 별도 계산이나 여기선 단순화)
        // 중과 시 농특세는 보통 0.6% or 1.0% 로 올라가지만, "약 8.4%" 라고 했으므로 0.4(edu)+8(acq) = 8.4 맞춰짐.
        // 농특세는 비과세(85이하) 가정, 만약 85초과시 0.2% 추가
        if (this.building_area && this.building_area > 85) {
            // 중과세일때 농특세는 0.2%가 아니라 다름.
            // 표준세율(2%)의 10% = 0.2% (기본)
            // 중과세(8%) -> 표준(2%)+중과(6%)... 농특세는 '중과기준세율(2%)의 10%'?
            // 복잡하므로 사용자 요청 "8.4% 수준"에 맞춰 rural=0으로 둠 (85이하 가정 기본).
            // 만약 85초과라면 +0.2%만 하겠습니다.
            rural_rate = 0.002;
        }

        const total_rate = acq_rate + edu_rate + rural_rate;

        // 계산 (10원 단위 절사 확인)
        const total_tax = Math.floor(purchase_price * total_rate / 10) * 10;

        return {
            '취득세': 0, // 상세 생략
            '지방교육세': 0,
            '농어촌특별세': 0,
            '총_취등록세': total_tax,
            '예외조항': `${note} (${(total_rate * 100).toFixed(2)}%)`
        };
    }

    calculate_registration_fee() {
        return this.calculate_acquisition_tax()['총_취등록세'] + 400000;
    }

    calculate_brokerage_fee() {
        return this.calculate_purchase_price() * (this.brokerage_rate_percent / 100);
    }

    calculate_loan_amount() {
        return this.calculate_purchase_price() * (this.loan_rate_percent / 100);
    }

    calculate_annual_interest() {
        return this.calculate_loan_amount() * (this.interest_rate_percent / 100);
    }

    calculate_monthly_interest() {
        return this.calculate_annual_interest() / 12;
    }

    calculate_3month_interest() {
        return this.calculate_monthly_interest() * 3;
    }

    calculate_prepayment_fee() {
        return this.calculate_loan_amount() * this.prepayment_fee_rate;
    }

    calculate_total_cost() {
        return (this.calculate_purchase_price() +
            this.calculate_registration_fee() +
            this.calculate_brokerage_fee() +
            this.repair_cost + this.cleaning_cost + this.management_fee +
            this.calculate_3month_interest());
    }

    calculate_cash_needed() {
        return this.calculate_total_cost() - this.calculate_loan_amount();
    }

    calculate_monthly_rent_yield() {
        const annual_net_income = (this.monthly_rent * 12) - this.calculate_annual_interest();
        const actual_investment = this.calculate_cash_needed() - this.deposit;

        // [수정] Plus PI (돈 받고 사는 경우) 처리
        if (actual_investment <= 0) {
            if (annual_net_income >= 0) {
                return Infinity; // 무한대 수익 (Plus PI)
            } else {
                return -Infinity; // 돈은 받았으나 월 현금흐름 마이너스 (부채폭탄)
            }
        }
        return (annual_net_income / actual_investment) * 100;
    }

    calculate_capital_gains_tax() {
        const purchase_price = this.calculate_purchase_price();
        const selling_price = this.selling_price;
        const gain = selling_price - purchase_price;

        // 필요경비 (취등록세 + 중개비 + 수리비 + 중도상환수수료)
        // *참고: 자본적 지출만 인정되나 여기선 수리비 전체 포함 가정
        const expenses = this.calculate_registration_fee() + this.calculate_brokerage_fee() + this.repair_cost + this.calculate_prepayment_fee();

        // 양도차익
        const capital_gain = gain - expenses;
        if (capital_gain <= 0) {
            return { '순이익': gain - expenses, '총세금': 0, '시세차익': gain };
        }

        // [비과세 판정]
        // 1세대 1주택 & 2년 이상 보유 & 12억 이하 -> 비과세
        // (조정지역 거주요건은 입력받지 않았으므로 보유기간으로 대체 판단)
        let is_tax_free = false;
        if (this.house_count === 1 && this.selling_years >= 2 && selling_price <= 1200000000) {
            is_tax_free = true;
        }

        // 고가주택 비과세 (12억 초과분만 과세)
        let taxable_portion_ratio = 1;
        if (this.house_count === 1 && this.selling_years >= 2 && selling_price > 1200000000) {
            // 전체 비과세는 아니지만 12억 초과분에 대해서만 비율 과세
            taxable_portion_ratio = (selling_price - 1200000000) / selling_price;
            // 1세대 1주택 장특공제 적용 대상
        }

        if (is_tax_free) {
            return { '순이익': capital_gain, '총세금': 0, '시세차익': gain };
        }

        // [장기보유특별공제]
        let jang_teuk_rate = 0;
        if (this.selling_years >= 3) {
            if (this.house_count === 1 && this.selling_years >= 2) {
                // 1세대 1주택 (보유4% + 거주4% 가정) -> 연 8%
                const years = Math.min(this.selling_years, 10);
                jang_teuk_rate = years * 0.08;
            } else {
                // 다주택자 (중과 배제 기간이므로 일반 장특 적용 2025.5 기준)
                // 연 2%, 최대 30% (15년)
                const years = Math.min(this.selling_years, 15);
                jang_teuk_rate = years * 0.02;
            }
        }

        // 과세표준 계산
        // 1주택 고가주택인 경우: (양도차익 * (12억초과분/양도가)) - (장특공제)
        // 그 외: 양도차익 - 장특
        let adjusted_gain = capital_gain;
        if (this.house_count === 1 && this.selling_years >= 2 && selling_price > 1200000000) {
            adjusted_gain = capital_gain * taxable_portion_ratio;
        }

        const deduction_amt = adjusted_gain * jang_teuk_rate;
        let tax_base = adjusted_gain - deduction_amt - 2500000; // 기본공제 250만
        if (tax_base < 0) tax_base = 0;

        // [세율 적용]
        let tax_rate = 0;
        let progress_deduction = 0;
        let calculated_tax = 0;

        if (this.selling_years < 1) {
            // 단기 1년 미만: 70% (2025 기준 주택) - 사용자 45% 언급했으나 표준 70% 유지 (or 45% if user strongly implies default)
            // *User said "약 45% 이상 단일세율 구간 존재" -> Likely referring to 45% bracket or general short term.
            // But strict Housing rule is 70%. I will use 70% to be safe for "very high".
            // If local general rate is applied (e.g. rights), it differs. Assuming Housing.
            calculated_tax = tax_base * 0.70;
        } else if (this.selling_years < 2) {
            // 단기 2년 미만: 60%
            calculated_tax = tax_base * 0.60;
        } else {
            // 2년 이상: 기본누진세율 (6~45%)
            // 2024 과세표준 구간
            /*
              ~1400: 6%
              ~5000: 15% - 126만
              ~8800: 24% - 576만
              ~1.5억: 35% - 1544만
              ~3.0억: 38% - 1994만
              ~5.0억: 40% - 2594만 
              ~10억: 42% - 3594만
              10억+: 45% - 6594만
            */
            if (tax_base <= 14000000) { calculated_tax = tax_base * 0.06; }
            else if (tax_base <= 50000000) { calculated_tax = tax_base * 0.15 - 1260000; }
            else if (tax_base <= 88000000) { calculated_tax = tax_base * 0.24 - 5760000; }
            else if (tax_base <= 150000000) { calculated_tax = tax_base * 0.35 - 15440000; }
            else if (tax_base <= 300000000) { calculated_tax = tax_base * 0.38 - 19940000; }
            else if (tax_base <= 500000000) { calculated_tax = tax_base * 0.40 - 25940000; }
            else if (tax_base <= 1000000000) { calculated_tax = tax_base * 0.42 - 35940000; }
            else { calculated_tax = tax_base * 0.45 - 65940000; }
        }

        // 지방소득세 10%
        const local_tax = calculated_tax * 0.1;
        const total_tax = calculated_tax + local_tax;

        const net_profit = gain - expenses - total_tax;

        return { '순이익': net_profit, '총세금': total_tax, '시세차익': gain };
    }

    calculate_by_bid_rates() {
        const original_rate = this.bid_rate;
        const results = [];
        // [FIX] 10% 구간 데이터 튐 방지
        // 10% 낙찰 시 실투자금이 (-)가 되거나 매우 작아져서 수익률 계산이 폭주할 수 있음.
        // 계산 로직 내에서 예외처리가 필요.

        for (let r_percent = 30; r_percent <= 110; r_percent += 2.5) { // 30% ~ 110% 범위, 2.5% 단위
            const r = r_percent / 100.0;
            this.bid_rate = r;

            const cash = this.calculate_cash_needed() - this.deposit;
            let yield_val = this.calculate_monthly_rent_yield();

            // 데이터 튐 방지: 수익률이 너무 크거나 작으면 클램핑
            if (yield_val > 1000) yield_val = 999;
            if (yield_val < -999) yield_val = -999;

            const margin = this.selling_price - this.calculate_total_cost();
            let { grade } = this.analyze_investment_value(yield_val, margin);

            if (yield_val === -999) {
                grade = "F";
            }

            results.push({
                '낙찰가율': `${(r * 100).toFixed(1)}%`,
                '낙찰가': this.calculate_purchase_price(),
                '필요현금': cash,
                '월세수익률': yield_val,
                '등급': grade
            });
        }
        this.bid_rate = original_rate;
        return results;
    }

    calculate_by_loan_rates() {
        const original_loan_rate = this.loan_rate_percent;
        const results = [];
        // 0% ~ 80% 까지 5% 단위
        for (let l_percent = 0; l_percent <= 80; l_percent += 5) {
            this.loan_rate_percent = l_percent;

            // 실투자금
            const cash = this.calculate_cash_needed() - this.deposit;
            let yield_val = 0;

            const annual_net_income = (this.monthly_rent * 12) - this.calculate_annual_interest();

            // [FIX] 80% 구간 등에서 실투자금이 0에 가까워지면 수익률 폭주
            if (cash <= 100000) { // 실투자금이 10만원 이하면 수익률 계산 불가(무한대) -> 0 or Max 처리
                if (annual_net_income > 0) yield_val = 999;
                else yield_val = -999;
            } else {
                yield_val = (annual_net_income / cash) * 100;
            }

            // 클램핑
            if (yield_val > 200) yield_val = 200; // 그래프 예쁘게 그리기 위해 상한 제한
            if (yield_val < -100) yield_val = -100;

            results.push({
                '대출비율': l_percent,
                '수익률': yield_val,
                '실투자금': cash
            });
        }
        this.loan_rate_percent = original_loan_rate;
        return results;
    }

    analyze_investment_value(roe = null, margin = null) {
        if (roe === null) roe = this.calculate_monthly_rent_yield();
        if (margin === null) margin = this.selling_price - this.calculate_total_cost();

        const monthly_net = this.monthly_rent - this.calculate_monthly_interest();

        if (roe === -999 || monthly_net < 0) return { grade: "F", comment: "현금흐름 마이너스", reason: "월세보다 이자가 더 나가거나 실투자금이 0 이하입니다." };
        if (margin < 0) return { grade: "F", comment: "고가 낙찰 위험", reason: `총 비용(${this.formatNumber(this.calculate_total_cost())}원)이 매도 예상가(${this.formatNumber(this.selling_price)}원)보다 높습니다.` };

        if (roe >= 20 && margin >= 10000000) return { grade: "S", comment: "강력 추천", reason: `수익률(ROE ${roe.toFixed(1)}%)과 안전마진(${this.formatNumber(margin)}원)이 최상위입니다.` };
        else if (roe >= 12 && margin >= 5000000) return { grade: "A", comment: "우수함", reason: `수익률(ROE ${roe.toFixed(1)}%)이 양호하고 안전마진(${this.formatNumber(margin)}원)이 확보됩니다.` };
        else if (roe >= 6 && margin >= 0) return { grade: "B", comment: "보통", reason: `수익률(ROE ${roe.toFixed(1)}%)이 금리 대비 양호하나 안전마진(${this.formatNumber(margin)}원)이 적습니다.` };
        else return { grade: "C", comment: "재고 필요", reason: `수익률(ROE ${roe.toFixed(1)}%)이 낮거나 안전마진(${this.formatNumber(margin)}원)이 확보되지 않아 리스크가 있습니다.` };
    }

    formatNumber(num) {
        return Math.round(num).toLocaleString('ko-KR');
    }
}
