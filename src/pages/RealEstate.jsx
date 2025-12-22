import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RealEstateAuctionCalculator from '../utils/calculator';

const RealEstate = () => {
    // Input State
    const [inputs, setInputs] = useState({
        case_number: '',
        appraisal_value: '500000000',
        bid_rate: '70',
        tenant_status: '없음',
        address: '',
        public_price: '0',
        house_count: '1',
        is_adjustment_area: '아니오',
        interest_rate_percent: '5.0',
        loan_rate_percent: '80.0',
        deposit: '10000000',
        monthly_rent: '500000',
        brokerage_rate_percent: '0.4',
        repair_cost: '3000000',
        cleaning_cost: '350000',
        selling_price: '600000000',
        selling_years: '2'
    });

    // Result State
    const [result, setResult] = useState(null);

    // Eviction Cost State
    const [showEvictionCalc, setShowEvictionCalc] = useState(false);
    const [evictionPyeong, setEvictionPyeong] = useState('');
    const [evictionResult, setEvictionResult] = useState(null);

    const handleEvictionCalculate = () => {
        if (!evictionPyeong) return;

        const p = Number(evictionPyeong);
        const fixedCost = 100000 + 1100000; // Filing + Storage/Transport

        let workers = 0;
        if (p < 5) workers = 4;
        else if (p < 10) workers = 7;
        else if (p < 20) workers = 10;
        else if (p < 30) workers = 13;
        else if (p < 40) workers = 16;
        else if (p < 50) workers = 19;
        else {
            const extraUnits = Math.ceil((p - 50) / 10);
            workers = 19 + (extraUnits * 2);
        }

        const laborCost = workers * 130000;
        const totalCost = fixedCost + laborCost;

        setEvictionResult({
            workers,
            fixedCost,
            laborCost,
            totalCost
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Simple numeric formatting removal if needed, but for now raw strings
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const formatNumber = (num) => Math.round(Number(num)).toLocaleString('ko-KR');
    const parseNumber = (str) => Number(String(str).replace(/,/g, ''));

    const handleCalculate = (e) => {
        e.preventDefault();

        const calc = new RealEstateAuctionCalculator();
        calc.case_number = inputs.case_number;
        calc.appraisal_value = parseNumber(inputs.appraisal_value);
        calc.bid_rate = parseNumber(inputs.bid_rate) / 100;
        calc.address = inputs.address;
        calc.tenant_status = inputs.tenant_status;

        calc.loan_rate_percent = parseNumber(inputs.loan_rate_percent);
        calc.interest_rate_percent = parseNumber(inputs.interest_rate_percent);
        calc.brokerage_rate_percent = parseNumber(inputs.brokerage_rate_percent);

        calc.repair_cost = parseNumber(inputs.repair_cost);
        calc.cleaning_cost = parseNumber(inputs.cleaning_cost);

        calc.deposit = parseNumber(inputs.deposit);
        calc.monthly_rent = parseNumber(inputs.monthly_rent);

        calc.selling_price = parseNumber(inputs.selling_price);
        calc.selling_years = parseNumber(inputs.selling_years);
        calc.house_count = inputs.house_count === '4+' ? 4 : Number(inputs.house_count);
        calc.is_adjustment_area = inputs.is_adjustment_area === '예';

        // Perform Calculations
        const purchasePrice = calc.calculate_purchase_price();
        const acqTax = calc.calculate_acquisition_tax();
        const totalCost = calc.calculate_total_cost();
        const cashNeeded = calc.calculate_cash_needed();
        const loanAmount = calc.calculate_loan_amount();
        const monthlyInterest = calc.calculate_monthly_interest();
        const monthlyNet = inputs.monthly_rent - monthlyInterest; // Simplify
        const roe = calc.calculate_monthly_rent_yield();
        const sellResult = calc.calculate_capital_gains_tax();
        const analysis = calc.analyze_investment_value(roe, sellResult['시세차익']); // Using gross margin for analysis simplification

        setResult({
            purchasePrice,
            acqTax: acqTax['총_취등록세'],
            totalCost,
            cashNeeded: cashNeeded - parseNumber(inputs.deposit), // Actual investment
            loanAmount,
            monthlyInterest,
            monthlyNet,
            roe,
            sellPrice: calc.selling_price,
            capTax: sellResult['총세금'],
            netProfit: sellResult['순이익'],
            grade: analysis.grade,
            comment: analysis.comment,
            reason: analysis.reason
        });
    };

    // Helper for Input Fields
    const InputGroup = ({ label, name, type = "text", value, onChange }) => (
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
            <label style={{ flex: '1', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                style={{
                    flex: '2',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem'
                }}
            />
        </div>
    );

    const SelectGroup = ({ label, name, value, options, onChange }) => (
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
            <label style={{ flex: '1', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                style={{
                    flex: '2',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem'
                }}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <div style={{ marginBottom: '32px', paddingTop: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>←</span> Back
                </Link>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginTop: '16px' }}>Real Estate Calculator</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'start' }}>

                {/* Input Column */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Data Input</h3>
                    <form onSubmit={handleCalculate}>
                        <InputGroup label="물건번호" name="case_number" value={inputs.case_number} onChange={handleInputChange} />
                        <InputGroup label="감정가(원)" name="appraisal_value" value={inputs.appraisal_value} onChange={handleInputChange} />
                        <InputGroup label="낙찰가율(%)" name="bid_rate" value={inputs.bid_rate} onChange={handleInputChange} />
                        <SelectGroup label="세입자" name="tenant_status" value={inputs.tenant_status} options={['없음', '대항력 있음', '대항력 없음']} onChange={handleInputChange} />
                        <InputGroup label="주소" name="address" value={inputs.address} onChange={handleInputChange} />
                        <InputGroup label="공시가" name="public_price" value={inputs.public_price} onChange={handleInputChange} />

                        <div style={{ margin: '20px 0', borderTop: '1px dashed var(--glass-border)' }}></div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>세금/대출</h4>
                        <SelectGroup label="주택수" name="house_count" value={inputs.house_count} options={['1', '2', '3', '4+']} onChange={handleInputChange} />
                        <SelectGroup label="조정지역" name="is_adjustment_area" value={inputs.is_adjustment_area} options={['아니오', '예']} onChange={handleInputChange} />
                        <InputGroup label="대출금리(%)" name="interest_rate_percent" value={inputs.interest_rate_percent} onChange={handleInputChange} />
                        <InputGroup label="대출한도(%)" name="loan_rate_percent" value={inputs.loan_rate_percent} onChange={handleInputChange} />

                        <div style={{ margin: '20px 0', borderTop: '1px dashed var(--glass-border)' }}></div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>비용/임대</h4>
                        <InputGroup label="보증금" name="deposit" value={inputs.deposit} onChange={handleInputChange} />
                        <InputGroup label="월세" name="monthly_rent" value={inputs.monthly_rent} onChange={handleInputChange} />
                        <InputGroup label="중개비율(%)" name="brokerage_rate_percent" value={inputs.brokerage_rate_percent} onChange={handleInputChange} />
                        <InputGroup label="수리비" name="repair_cost" value={inputs.repair_cost} onChange={handleInputChange} />
                        <InputGroup label="청소/관리" name="cleaning_cost" value={inputs.cleaning_cost} onChange={handleInputChange} />

                        <div style={{ margin: '20px 0', borderTop: '1px dashed var(--glass-border)' }}></div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>매도 계획</h4>
                        <InputGroup label="매도예상가" name="selling_price" value={inputs.selling_price} onChange={handleInputChange} />
                        <InputGroup label="보유년수" name="selling_years" value={inputs.selling_years} onChange={handleInputChange} />

                        <button style={{
                            width: '100%',
                            padding: '16px',
                            background: 'var(--gradient-1)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            marginTop: '20px',
                            cursor: 'pointer'
                        }}>
                            AI 분석 실행
                        </button>
                    </form>

                    {/* Forced Eviction Cost Calculator Section */}
                    <div style={{ marginTop: '32px', borderTop: '1px dashed var(--glass-border)', paddingTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setShowEvictionCalc(!showEvictionCalc)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>🏗️ 강제집행 비용 계산기</span>
                            <span>{showEvictionCalc ? '▲' : '▼'}</span>
                        </button>

                        {showEvictionCalc && (
                            <div className="fade-in" style={{ marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <input
                                        type="number"
                                        placeholder="전용면적 (평)"
                                        value={evictionPyeong}
                                        onChange={(e) => setEvictionPyeong(e.target.value)}
                                        style={{
                                            flex: '1',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEvictionCalculate()}
                                    />
                                    <button
                                        onClick={handleEvictionCalculate}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'var(--text-accent)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        계산
                                    </button>
                                </div>

                                {evictionResult && (
                                    <div style={{ fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>투입 인원:</span>
                                            <span style={{ fontWeight: 'bold' }}>{evictionResult.workers}명</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>예상 비용:</span>
                                            <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{formatNumber(evictionResult.totalCost)}원</span>
                                        </div>

                                        <details style={{ marginBottom: '8px' }}>
                                            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>상세 내역 보기</summary>
                                            <div style={{ marginTop: '8px', paddingLeft: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <div>• 고정비 (접수+운반/보관): {formatNumber(evictionResult.fixedCost)}원</div>
                                                <div>• 노무비 ({evictionResult.workers}인): {formatNumber(evictionResult.laborCost)}원</div>
                                            </div>
                                        </details>

                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,200,0,0.1)', padding: '8px', borderRadius: '4px' }}>
                                            ⚠️ <strong>주의사항</strong><br />
                                            - 야간/공휴일 집행 시 20~30% 할증<br />
                                            - 특수장비(사다리차 등) 비용 별도<br />
                                            - 실제 집행 상황에 따라 환급/추가 청구 가능
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Column */}
                <div className="glass-card" style={{ padding: '32px', minHeight: '600px' }}>
                    {!result ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                            <span style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</span>
                            <p>좌측 정보를 입력하고 분석을 실행하세요</p>
                        </div>
                    ) : (
                        <div className="fade-in"> { /* Assuming global css has fade-in */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    color: result.grade === 'S' || result.grade === 'A' ? '#4ade80' : result.grade === 'B' ? '#facc15' : '#f87171',
                                    marginBottom: '8px'
                                }}>
                                    {result.grade} 등급
                                </div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{result.comment}</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>{result.reason}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Left Sub-col */}
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '2px solid var(--text-accent)', paddingBottom: '8px' }}>물건 개요</h4>
                                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <tbody>
                                            <tr><td style={{ color: 'var(--text-secondary)' }}>감정가</td><td style={{ textAlign: 'right' }}>{formatNumber(inputs.appraisal_value)}</td></tr>
                                            <tr><td style={{ color: 'var(--text-secondary)' }}>낙찰가 ({inputs.bid_rate}%)</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(result.purchasePrice)}</td></tr>
                                            <tr><td style={{ color: 'var(--text-secondary)' }}>총 취득비용</td><td style={{ textAlign: 'right' }}>{formatNumber(result.totalCost)}</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Right Sub-col */}
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '2px solid var(--text-accent)', paddingBottom: '8px' }}>수익성 분석</h4>
                                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <tbody>
                                            <tr><td style={{ color: 'var(--text-secondary)' }}>실투자금</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(result.cashNeeded)}</td></tr>
                                            <tr><td style={{ color: 'var(--text-secondary)' }}>월 순수익</td><td style={{ textAlign: 'right' }}>{formatNumber(result.monthlyNet)}</td></tr>
                                            <tr><td style={{ color: 'var(--text-secondary)' }}>수익률 (ROE)</td><td style={{ textAlign: 'right', color: 'var(--text-accent)', fontWeight: 'bold' }}>{result.roe.toFixed(2)}%</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px' }}>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '2px solid var(--text-accent)', paddingBottom: '8px' }}>매도 시나리오 ({inputs.selling_years}년)</h4>
                                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                    <tbody>
                                        <tr><td style={{ color: 'var(--text-secondary)' }}>매도 예상가</td><td style={{ textAlign: 'right' }}>{formatNumber(result.sellPrice)}</td></tr>
                                        <tr><td style={{ color: 'var(--text-secondary)' }}>양도세 등</td><td style={{ textAlign: 'right' }}>{formatNumber(result.capTax)}</td></tr>
                                        <tr><td style={{ color: 'var(--text-secondary)' }}>최종 순이익</td><td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatNumber(result.netProfit)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RealEstate;
