import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Blob URL을 Base64로 변환하는 유틸리티
const getBase64ImageFromUrl = async (imageUrl) => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateExcel = async (address, landData, images) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Real Estate Analyzer';
  workbook.created = new Date();

  // 테두리 적용 헬퍼
  const applyBorder = (sheet, startRow, endRow, startCol, endCol) => {
    for(let r = startRow; r <= endRow; r++) {
      for(let c = startCol; c <= endCol; c++) {
         sheet.getCell(r, c).border = {
           top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
         };
      }
    }
  }

  // ==========================================
  // Sheet 1: 1토지 기본조사서
  // ==========================================
  const sheet1 = workbook.addWorksheet('1토지 기본조사서', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } }
  });
  
  sheet1.columns = [
    { width: 8 }, { width: 8 }, { width: 12 }, { width: 15 }, 
    { width: 10 }, { width: 10 }, { width: 12 }, { width: 12 }, 
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }
  ];

  sheet1.mergeCells('A2:L3');
  const titleCell = sheet1.getCell('A2');
  titleCell.value = '토지 기본조사서';
  titleCell.font = { size: 20, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet1.mergeCells('A5:C6'); sheet1.getCell('A5').value = '공익사업의 명칭';
  sheet1.mergeCells('D5:H6'); sheet1.getCell('D5').value = '';
  sheet1.mergeCells('I5:J5'); sheet1.getCell('I5').value = '조사자';
  sheet1.mergeCells('K5:L5'); sheet1.getCell('K5').value = '(서명 또는 인)';
  sheet1.mergeCells('A7:C8'); sheet1.getCell('A7').value = '사업시행자';
  sheet1.mergeCells('D7:H8'); sheet1.getCell('D7').value = '';
  sheet1.mergeCells('I6:J7'); sheet1.getCell('I6').value = '확인자';
  sheet1.mergeCells('K6:L7'); sheet1.getCell('K6').value = '(서명 또는 인)';
  sheet1.mergeCells('A9:C10'); sheet1.getCell('A9').value = '조사기간';
  sheet1.mergeCells('D9:H10'); sheet1.getCell('D9').value = '';
  sheet1.mergeCells('I8:J10'); sheet1.getCell('I8').value = '작성일';
  sheet1.mergeCells('K8:L10'); sheet1.getCell('K8').value = new Date().toLocaleDateString();
  
  sheet1.mergeCells('A12:C13'); sheet1.getCell('A12').value = '공람·공고일 :';
  sheet1.mergeCells('D12:G13'); sheet1.getCell('D12').value = '사업인정고시일\n(사업시행계획인가일) :';
  sheet1.mergeCells('H12:I13'); sheet1.getCell('H12').value = '-';
  sheet1.mergeCells('J12:L13'); sheet1.getCell('J12').value = '행위제한고시일 :';
  
  applyBorder(sheet1, 5, 10, 1, 12);
  applyBorder(sheet1, 12, 13, 1, 12);
  
  sheet1.getCell('A15').value = '1. 토지내역';
  sheet1.mergeCells('A16:A17'); sheet1.getCell('A16').value = '번호';
  sheet1.mergeCells('B16:C17'); sheet1.getCell('B16').value = '1';
  sheet1.mergeCells('D16:D17'); sheet1.getCell('D16').value = '소재지';
  sheet1.mergeCells('E16:L17'); sheet1.getCell('E16').value = address;
  
  sheet1.mergeCells('A18:B18'); sheet1.getCell('A18').value = '지 번';
  sheet1.getCell('A19').value = '분할전';
  sheet1.getCell('B19').value = '편입';
  sheet1.mergeCells('C18:C19'); sheet1.getCell('C18').value = '지 목';
  sheet1.mergeCells('D18:D19'); sheet1.getCell('D18').value = '현실적인\n이용상황';
  sheet1.mergeCells('E18:F18'); sheet1.getCell('E18').value = '면 적(m²)';
  sheet1.getCell('E19').value = '전체';
  sheet1.getCell('F19').value = '편입';
  sheet1.mergeCells('G18:I19'); sheet1.getCell('G18').value = '용도지역등';
  sheet1.mergeCells('J18:L19'); sheet1.getCell('J18').value = '관련지번';

  sheet1.getCell('A20').value = landData?.jibun || '';
  sheet1.getCell('B20').value = landData?.jibun || '';
  sheet1.getCell('C20').value = landData?.jimok || '';
  sheet1.getCell('D20').value = landData?.jimok || '';
  sheet1.getCell('E20').value = landData?.area || '';
  sheet1.getCell('F20').value = landData?.area || '';
  sheet1.mergeCells('G20:I20'); sheet1.getCell('G20').value = landData?.zoning || '';
  sheet1.mergeCells('J20:L20'); sheet1.getCell('J20').value = '';
  
  applyBorder(sheet1, 16, 20, 1, 12);

  sheet1.getCell('A22').value = '2. 조사내역';
  sheet1.getCell('A23').value = '둘 이상의';
  sheet1.mergeCells('B23:D23'); sheet1.getCell('B23').value = '현실적인 이용상황';
  sheet1.mergeCells('E23:L23'); sheet1.getCell('E23').value = '';
  sheet1.getCell('A24').value = '현황·용도';
  sheet1.mergeCells('B24:D24'); sheet1.getCell('B24').value = '용도지역등';
  sheet1.mergeCells('E24:L24'); sheet1.getCell('E24').value = '';
  sheet1.getCell('A25').value = '면적 구분';
  sheet1.mergeCells('B25:D25'); sheet1.getCell('B25').value = '해당면적(m²)';
  sheet1.mergeCells('E25:L25'); sheet1.getCell('E25').value = '';
  sheet1.getCell('A26').value = '자연림\n유/무';
  sheet1.mergeCells('B26:C26'); sheet1.getCell('B26').value = '무';
  sheet1.getCell('D26').value = '경작\n여/부';
  sheet1.mergeCells('E26:F26'); sheet1.getCell('E26').value = '무';
  sheet1.getCell('G26').value = '건축물\n유/무';
  sheet1.mergeCells('H26:I26'); sheet1.getCell('H26').value = '무';
  sheet1.mergeCells('J26:K26'); sheet1.getCell('J26').value = '대지권\n유/무';
  sheet1.getCell('L26').value = '무';
  
  applyBorder(sheet1, 23, 26, 1, 12);
  
  sheet1.eachRow((row) => {
    row.eachCell((cell) => {
      if(!cell.alignment) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    });
  });

  // ==========================================
  // Sheet 2: 2용지도 및 현황사진
  // ==========================================
  const sheet2 = workbook.addWorksheet('2용지도 및 현황사진');
  sheet2.columns = [{ width: 10 }, { width: 35 }, { width: 10 }, { width: 35 }];
  sheet2.mergeCells('A1:D2');
  const titleCell2 = sheet2.getCell('A1');
  titleCell2.value = '용지도 및 현황 사진';
  titleCell2.font = { size: 16, bold: true };
  titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet2.mergeCells('A4:D4'); sheet2.getCell('A4').value = '1. 용지도';
  sheet2.mergeCells('A5:D20'); 
  sheet2.mergeCells('A21:A22'); sheet2.getCell('A21').value = '비고';
  sheet2.mergeCells('B21:D22'); 
  
  sheet2.mergeCells('A24:B24'); sheet2.getCell('A24').value = '2. 항측도';
  sheet2.mergeCells('C24:D24'); sheet2.getCell('C24').value = '3. 현황사진';
  
  sheet2.mergeCells('A25:B40'); 
  sheet2.mergeCells('C25:D40'); 
  
  sheet2.mergeCells('A41:B41'); sheet2.getCell('A41').value = '비고';
  sheet2.mergeCells('C41:D41'); sheet2.getCell('C41').value = '비고';
  
  applyBorder(sheet2, 1, 2, 1, 4);
  applyBorder(sheet2, 4, 22, 1, 4);
  applyBorder(sheet2, 24, 41, 1, 4);
  sheet2.eachRow((row) => {
    row.eachCell((cell) => {
      if(!cell.alignment) cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  });

  // Adding Images to Sheet 2
  if (images && images.length > 0) {
    try {
      const base64Images = await Promise.all(images.map(img => getBase64ImageFromUrl(img)));
      if(base64Images[0]) {
        const imageId1 = workbook.addImage({ base64: base64Images[0], extension: 'png' });
        sheet2.addImage(imageId1, 'A5:D20');
      }
      if(base64Images[1]) {
        const imageId2 = workbook.addImage({ base64: base64Images[1], extension: 'png' });
        sheet2.addImage(imageId2, 'A25:B40');
      }
      if(base64Images[2]) {
        const imageId3 = workbook.addImage({ base64: base64Images[2], extension: 'png' });
        sheet2.addImage(imageId3, 'C25:D40');
      }
    } catch(err) {
      console.error("Error adding images to excel:", err);
    }
  }

  // ==========================================
  // Sheet 3: ■토지조서
  // ==========================================
  const sheet3 = workbook.addWorksheet('■토지조서', {
    pageSetup: { orientation: 'landscape', fitToPage: true }
  });
  sheet3.columns = [
    { width: 8 }, { width: 12 }, { width: 8 }, { width: 8 }, 
    { width: 8 }, { width: 8 }, { width: 10 }, { width: 10 }, 
    { width: 15 }, { width: 12 }, { width: 8 }, { width: 20 }, 
    { width: 15 }, { width: 25 }, { width: 10 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 15 }
  ];
  sheet3.mergeCells('A1:S1');
  const titleCell3 = sheet3.getCell('A1');
  titleCell3.value = '토 지 조 서';
  titleCell3.font = { size: 20, bold: true };
  titleCell3.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet3.views = [
    { state: 'frozen', xSplit: 4, ySplit: 6 }
  ];

  sheet3.getCell('A2').value = '■ 사업명 :';
  sheet3.getCell('A3').value = '■ 사업시행자 :';


  const headers0 = ['일련\n번호', '위치', '지번', '', '지목', '', '전체면적\n(m²)', '편입면적\n(m²)', '용도\n지역', '소유자', '', '', '', '', '', '', '관계인(이해관계인 등)', '', '특이사항'];
  const headers1 = ['', '', '당초', '편입', '원래\n지목', '편입\n지목', '', '', '', '성명', '지분', '토지 등기부 주소', '주민번호', '주민등록주소', '우편번호', '연락처', '성명', '권리관계', ''];
  
  sheet3.getRow(5).values = headers0;
  sheet3.getRow(6).values = headers1;
  
  sheet3.mergeCells('A5:A6');
  sheet3.mergeCells('B5:B6');
  sheet3.mergeCells('C5:D5');
  sheet3.mergeCells('E5:F5');
  sheet3.mergeCells('G5:G6');
  sheet3.mergeCells('H5:H6');
  sheet3.mergeCells('I5:I6');
  sheet3.mergeCells('J5:P5'); // 소유자 
  sheet3.mergeCells('Q5:R5'); // 관계인
  sheet3.mergeCells('S5:S6');
  
  sheet3.getRow(7).values = [
    '1', address, landData?.jibun, landData?.jibun, landData?.jimok, landData?.jimok, landData?.area, landData?.area, landData?.zoning,
    '', '', '', '', '', '', '', '', '', ''
  ];
  
  sheet3.autoFilter = 'A6:S6';

  applyBorder(sheet3, 5, 7, 1, 19);
  sheet3.eachRow((row, rowNumber) => {
    if(rowNumber >= 5) {
      row.eachCell((cell) => {
        if(!cell.alignment) cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
    }
  });

  // 헤더(5, 6번 행) 배경색 지정 (연한 녹색)
  for (let r = 5; r <= 6; r++) {
    for (let c = 1; c <= 19; c++) {
      sheet3.getCell(r, c).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD5E8D4' } // 캡쳐1과 유사한 연녹색
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, '토지기본조사서_결과.xlsx');
};
