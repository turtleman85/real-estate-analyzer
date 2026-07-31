"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";
import { generateExcel } from "../utils/excelExport";

export default function Home() {
  const [address, setAddress] = useState("");
  const [showDocument, setShowDocument] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 사진 업로드 관련 상태
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // AI 분석 상태
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 대장 정보 (Mock 데이터)
  const [landData, setLandData] = useState({
    jibun: "",
    jimok: "",
    area: "",
    zoning: ""
  });

  const handleSearch = () => {
    if (!address.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    // API 조회 모의 (1.5초 딜레이)
    setTimeout(() => {
      setLandData({
        jibun: "127-6",
        jimok: "대",
        area: "159",
        zoning: "제2종일반주거지역"
      });
      setIsLoading(false);
      setShowDocument(true);
    }, 1500);
  };

  // --- 드래그 앤 드롭 핸들러 ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => file.type.startsWith("image/"));
    const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImageUrls]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getBase64FromUrl = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAnalyzeImages = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult("");
    
    try {
      const base64Images = await Promise.all(images.map(url => getBase64FromUrl(url)));
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images })
      });
      
      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult("분석 실패: " + data.error);
      }
    } catch (err) {
      setAnalysisResult("분석 중 오류 발생");
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <div className={styles.container}>
      {/* 폼 입력 영역 (Hero) */}
      <div className={`${styles.hero} no-print`}>
        <h1>부동산 자동조사 및 건축물 분석 시스템</h1>
        <p style={{ marginBottom: "20px", opacity: 0.85, fontSize: "15px" }}>
          대상 부동산 주소를 입력하고 현장 사진을 업로드하면 공공 API와 AI가 분석하여 기본조사서를 생성합니다.
        </p>
        
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="부동산 주소를 입력하세요 (예: 부산진구 백양산로 53번길 125)" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button className={styles.button} onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "조회 중..." : "조회 및 생성"}
          </button>
        </div>

        {/* 파일 업로드 존 */}
        <div 
          className={styles.uploadZone}
          style={{ backgroundColor: isDragging ? 'rgba(255,255,255,0.2)' : '' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>📸</div>
          <p>현장 사진을 이곳에 드래그하거나 클릭하여 추가하세요 (다중 업로드 가능)</p>
          <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}>지원 형식: JPG, PNG, WEBP (건물 구조가 잘 보이는 사진 권장)</p>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={handleFileInput}
          />
        </div>

        {/* 업로드된 이미지 미리보기 */}
        {images.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                <img src={url} alt="upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 결과물 출력 영역 (Document) */}
      <div className={`${styles.document} ${showDocument ? styles.visible : ''}`}>
        <div className={styles.docHeader}>
          <span>■ 토지 및 물건 기본조사서 작성기준 [별지 제1호서식]</span>
        </div>
        <h2 className={styles.docTitle}>토지 기본조사서</h2>
        
        <table className={styles.docTable}>
          <tbody>
            <tr>
              <th>공익사업의 명칭</th>
              <td colSpan="3">신평1동~광천읍사무소 도시계획도로 개설사업</td>
              <th>조사자</th>
              <td>정채봉 (서명/인)</td>
            </tr>
            <tr>
              <th>사업시행자</th>
              <td colSpan="3">홍성군수</td>
              <th>확인자</th>
              <td>백일홍 (서명/인)</td>
            </tr>
            <tr>
              <th>조사기간</th>
              <td colSpan="3">2025-11-03 ~ 2025-11-20</td>
              <th>작성일</th>
              <td>2025-11-20</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.sectionTitle}>1. 토지내역</div>
        <table className={styles.docTable}>
          <thead>
            <tr>
              <th>번호</th>
              <th>16</th>
              <th>소재지</th>
              <th colSpan="5" style={{fontWeight: 'bold'}}>충청남도 홍성군 광천읍 광천리 (입력: {address})</th>
            </tr>
            <tr>
              <th colSpan="2">지번</th>
              <th rowSpan="2">지목</th>
              <th rowSpan="2">현실적인<br/>이용상황</th>
              <th colSpan="2">면적(㎡)</th>
              <th rowSpan="2" colSpan="2">용도지역 등</th>
              <th rowSpan="2">관련지번</th>
            </tr>
            <tr>
              <th>분할전</th>
              <th>편입</th>
              <th>전체</th>
              <th>편입</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{fontWeight: 'bold'}}>{landData.jibun}</td>
              <td style={{fontWeight: 'bold'}}>{landData.jibun}</td>
              <td style={{fontWeight: 'bold'}}>{landData.jimok}</td>
              <td style={{fontWeight: 'bold'}}>{landData.jimok}</td>
              <td style={{fontWeight: 'bold'}}>{landData.area}</td>
              <td style={{fontWeight: 'bold'}}>{landData.area}</td>
              <td colSpan="2" style={{fontWeight: 'bold'}}>{landData.zoning}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className={styles.sectionTitle}>2. 조사내역</div>
        <table className={styles.docTable}>
          <tbody>
            <tr>
              <th>둘 이상의</th>
              <th>현실적인 이용상황</th>
              <td colSpan="7">{landData.jimok}</td>
            </tr>
            <tr>
              <th>현황·용도</th>
              <th>용도지역 등</th>
              <td colSpan="7">{landData.zoning}</td>
            </tr>
            <tr>
              <th>면적 구분</th>
              <th>해당면적(㎡)</th>
              <td colSpan="7">{landData.area}</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.sectionTitle}>3. 소유자 및 관계인 (수기 입력)</div>
        <table className={styles.docTable}>
          <thead>
            <tr>
              <th colSpan="3">소유자</th>
              <th colSpan="3">관계인</th>
            </tr>
            <tr>
              <th>성명 또는 명칭</th>
              <th>소유지분</th>
              <th>주소</th>
              <th>성명 또는 명칭</th>
              <th>주소</th>
              <th>권리의 종류 및 내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" style={{width:'100%', border:'none', textAlign:'center', outline:'none'}} placeholder="이름 입력" /></td>
              <td><input type="text" style={{width:'100%', border:'none', textAlign:'center', outline:'none'}} placeholder="지분 (예: 1/2)" /></td>
              <td><input type="text" style={{width:'100%', border:'none', outline:'none'}} placeholder="주소 입력" /></td>
              <td><input type="text" style={{width:'100%', border:'none', textAlign:'center', outline:'none'}} /></td>
              <td><input type="text" style={{width:'100%', border:'none', outline:'none'}} /></td>
              <td><input type="text" style={{width:'100%', border:'none', textAlign:'center', outline:'none'}} /></td>
            </tr>
          </tbody>
        </table>

        <div className={styles.sectionTitle}>용지도 및 현황 사진</div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <div style={{ flex: 1, border: '1px solid #333', padding: '10px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>1. 용지도 (API 연동)</div>
            <div style={{ flex: 1, background: '#e0e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#666' }}>
              Vworld 지적도 맵 이미지 노출 영역 (Mock)
            </div>
          </div>
          <div style={{ flex: 1, border: '1px solid #333', padding: '10px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>2. 현황 사진 및 AI 분석</div>
            <div style={{ flex: 1, background: '#f5f5f5', display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
              <div style={{ flex: 1, border: '1px dashed #ccc', display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '5px', alignItems: 'center', justifyContent: 'center' }}>
                {images.length > 0 ? (
                  images.map((url, i) => (
                    <img key={i} src={url} alt="Uploaded" style={{ width: '48%', height: 'auto', objectFit: 'contain' }} />
                  ))
                ) : (
                  <span style={{ color: '#999', fontSize: '12px' }}>업로드된 사진 없음</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  className={`${styles.button} no-print`} 
                  onClick={handleAnalyzeImages}
                  disabled={images.length === 0 || isAnalyzing}
                  style={{ width: '100%', fontSize: '14px', padding: '8px' }}
                >
                  {isAnalyzing ? "AI 분석 중..." : "AI 구조 분석하기"}
                </button>
              </div>
              <div style={{ fontSize: '12px', background: '#fff', border: '1px solid #ddd', padding: '8px', borderRadius: '4px', minHeight: '80px' }}>
                <strong>💡 AI 구조 분석 코멘트:</strong><br/>
                {analysisResult ? (
                  <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{analysisResult}</div>
                ) : (
                  <span style={{ color: '#999', display: 'block', marginTop: '5px' }}>사진을 업로드하고 분석 버튼을 눌러주세요.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '40px 0 20px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button className={`${styles.button} no-print`} onClick={() => window.print()}>문서 인쇄 / PDF 저장</button>
          <button className={`${styles.button} no-print`} onClick={() => generateExcel(address, landData, images)} style={{ backgroundColor: '#217346' }}>엑셀 다운로드</button>
        </div>
      </div>
    </div>
  );
}
