# -*- coding: utf-8 -*-
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import threading, time, csv, webbrowser

class CourtSearchApp:
    def __init__(self, root):
        self.root = root
        self.root.title("대법원 경매 검색")
        self.root.geometry("1200x750")
        self.notices, self.running, self.filtered_count, self.total_count = [], False, 0, 0
        self.build_ui()
    
    def build_ui(self):
        ttk.Label(self.root, text="🏛️ 대법원 경매 공고 검색", font=("맑은 고딕", 14, "bold")).pack(pady=10)
        sf = ttk.LabelFrame(self.root, text="검색 조건", padding="10")
        sf.pack(padx=10, pady=5, fill=tk.X)
        ttk.Label(sf, text="포함:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.search_var = tk.StringVar(value="자동차")
        ttk.Entry(sf, textvariable=self.search_var, width=50).grid(row=0, column=1, pady=5, sticky=tk.W)
        bf = ttk.Frame(sf)
        bf.grid(row=1, column=1, sticky=tk.W, pady=2)
        for w in ["자동차", "부동산", "기계", "선박", "주식"]:
            ttk.Button(bf, text=w, command=lambda x=w: self.search_var.set(x), width=8).pack(side=tk.LEFT, padx=2)
        ttk.Label(sf, text="제외:", foreground="red").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.exclude_var = tk.StringVar()
        ttk.Entry(sf, textvariable=self.exclude_var, width=50).grid(row=2, column=1, pady=5, sticky=tk.W)
        ef = ttk.Frame(sf)
        ef.grid(row=3, column=1, sticky=tk.W, pady=2)
        for l, v in [("폐차/사고", "폐차,사고,침수"), ("압류", "압류"), ("포기", "포기"), ("초기화", "")]:
            ttk.Button(ef, text=l, command=lambda x=v: self.exclude_var.set(x), width=10).pack(side=tk.LEFT, padx=2)
        cf = ttk.Frame(self.root)
        cf.pack(pady=10)
        self.start_btn = ttk.Button(cf, text="🔍 검색", command=self.start, width=12)
        self.start_btn.pack(side=tk.LEFT, padx=5)
        self.stop_btn = ttk.Button(cf, text="⏹ 중지", command=self.stop, width=12, state=tk.DISABLED)
        self.stop_btn.pack(side=tk.LEFT, padx=5)
        ttk.Button(cf, text="💾 TXT", command=self.save_txt, width=10).pack(side=tk.LEFT, padx=2)
        ttk.Button(cf, text="📊 CSV", command=self.save_csv, width=10).pack(side=tk.LEFT, padx=2)
        ttk.Button(cf, text="🗑️ 지우기", command=self.clear, width=10).pack(side=tk.LEFT, padx=2)
        self.status = ttk.Label(self.root, text="대기중", foreground="gray")
        self.status.pack()
        self.pbar = ttk.Progressbar(self.root, mode='indeterminate', length=600)
        self.pbar.pack(pady=5)
        rf = ttk.LabelFrame(self.root, text="검색 결과", padding="5")
        rf.pack(padx=10, pady=5, fill=tk.BOTH, expand=True)
        self.count_label = ttk.Label(rf, text="총 0건", font=("맑은 고딕", 10, "bold"))
        self.count_label.pack(pady=5)
        tf = ttk.Frame(rf)
        tf.pack(fill=tk.BOTH, expand=True)
        sy = ttk.Scrollbar(tf, orient=tk.VERTICAL)
        sy.pack(side=tk.RIGHT, fill=tk.Y)
        sx = ttk.Scrollbar(tf, orient=tk.HORIZONTAL)
        sx.pack(side=tk.BOTTOM, fill=tk.X)
        cols = ('번호', '법원', '매각기관', '제목', '조회수', '링크')
        self.tree = ttk.Treeview(tf, columns=cols, show='headings', yscrollcommand=sy.set, xscrollcommand=sx.set)
        sy.config(command=self.tree.yview)
        sx.config(command=self.tree.xview)
        for c, t, w in [('번호', '번호', 50), ('법원', '법원', 150), ('매각기관', '매각기관', 250), ('제목', '제목', 400), ('조회수', '조회', 70), ('링크', '바로가기', 80)]:
            self.tree.heading(c, text=t)
            self.tree.column(c, width=w, anchor=tk.CENTER if c in ['번호', '조회수', '링크'] else tk.W)
        self.tree.pack(fill=tk.BOTH, expand=True)
        self.tree.bind('<Double-Button-1>', lambda e: self.open_link())
        self.menu = tk.Menu(self.root, tearoff=0)
        self.menu.add_command(label="🔗 열기", command=self.open_link)
        self.menu.add_command(label="📋 복사", command=self.copy_link)
        self.menu.add_separator()
        self.menu.add_command(label="❌ 삭제", command=self.delete_item)
        self.tree.bind('<Button-3>', self.show_menu)
        self.tree.tag_configure('excluded', foreground='red')
    
    def show_menu(self, e):
        item = self.tree.identify_row(e.y)
        if item:
            self.tree.selection_set(item)
            self.menu.post(e.x_root, e.y_root)
    
    def open_link(self):
        sel = self.tree.selection()
        if sel:
            v = self.tree.item(sel[0], 'values')
            if len(v) >= 6 and v[5].startswith('http'):
                webbrowser.open(v[5])
    
    def copy_link(self):
        sel = self.tree.selection()
        if sel:
            v = self.tree.item(sel[0], 'values')
            if len(v) >= 6:
                self.root.clipboard_clear()
                self.root.clipboard_append(v[5])
                messagebox.showinfo("완료", "복사됨!")
    
    def delete_item(self):
        sel = self.tree.selection()
        if sel and messagebox.askyesno("삭제", "삭제?"):
            for i in sel:
                self.tree.delete(i)
            self.update_count()
    
    def update_count(self):
        cnt = len([x for x in self.tree.get_children() if not self.tree.item(x, 'values')[0].startswith('[제외')])
        self.count_label.config(text=f"총 {cnt}건 (전체: {self.total_count}, 제외: {self.filtered_count})")
    
    def start(self):
        if not self.search_var.get().strip():
            messagebox.showwarning("경고", "검색어 입력")
            return
        self.running = True
        self.notices, self.filtered_count, self.total_count = [], 0, 0
        for i in self.tree.get_children():
            self.tree.delete(i)
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.pbar.start()
        self.status.config(text="검색중...", foreground="blue")
        threading.Thread(target=self.run_search, daemon=True).start()
    
    def stop(self):
        self.running = False
        self.pbar.stop()
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.status.config(text="중지됨", foreground="red")
    
    def should_exclude(self, text):
        ex = self.exclude_var.get().strip()
        if not ex:
            return False, None
        for k in [x.strip() for x in ex.split(',') if x.strip()]:
            if k.lower() in text.lower():
                return True, k
        return False, None
    
    def run_search(self):
        driver = None
        try:
            opt = Options()
            opt.add_argument('--no-sandbox')
            opt.add_argument('--disable-dev-shm-usage')
            opt.add_experimental_option('excludeSwitches', ['enable-logging'])
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opt)
            driver.get("https://www.scourt.go.kr/portal/notice/realestate/RealNoticeList.work")
            time.sleep(2)
            inp = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "searchWord")))
            inp.clear()
            inp.send_keys(self.search_var.get())
            time.sleep(1)
            for btn in driver.find_elements(By.XPATH, "//a[contains(text(), '검색')]"):
                if btn.text.strip() == '검색':
                    btn.click()
                    break
            time.sleep(3)
            page = 1
            while self.running:
                self.root.after(0, lambda p=page: self.status.config(text=f"{p}페이지 수집중..."))
                rows = driver.find_element(By.TAG_NAME, "table").find_elements(By.TAG_NAME, "tr")
                for row in rows:
                    if not self.running:
                        break
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) == 5:
                        try:
                            link = cells[3].find_element(By.TAG_NAME, "a").get_attribute("href")
                        except:
                            link = ""
                        title, agency = cells[3].text.strip(), cells[2].text.strip()
                        if title:
                            self.total_count += 1
                            is_ex, kw = self.should_exclude(f"{title} {agency}")
                            v = (f"[제외:{kw}]" if is_ex else str(len(self.notices) + 1), cells[1].text.strip(), agency, title, cells[4].text.strip(), link)
                            if not is_ex:
                                self.notices.append(v)
                            else:
                                self.filtered_count += 1
                            self.root.after(0, lambda val=v, e=is_ex: self.tree.insert('', tk.END, values=val, tags=('excluded' if e else 'normal',)))
                            self.root.after(0, self.update_count)
                try:
                    next_link = driver.find_element(By.XPATH, f"//a[contains(@href, 'pageIndex={page+1}')]")
                    driver.execute_script("arguments[0].scrollIntoView();", next_link)
                    time.sleep(0.5)
                    next_link.click()
                    time.sleep(2)
                    page += 1
                except:
                    break
            self.root.after(0, self.done)
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("오류", str(e)))
        finally:
            if driver:
                driver.quit()
    
    def done(self):
        self.pbar.stop()
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.status.config(text=f"완료! {len(self.notices)}건", foreground="green")
    
    def save_txt(self):
        if not self.notices:
            messagebox.showwarning("경고", "데이터 없음")
            return
        f = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text", "*.txt")])
        if f:
            with open(f, 'w', encoding='utf-8') as file:
                for v in self.notices:
                    file.write(f"{v[0]}. {v[3]}\n법원: {v[1]}\n매각기관: {v[2]}\n링크: {v[5]}\n\n")
            messagebox.showinfo("완료", "저장됨!")
    
    def save_csv(self):
        if not self.notices:
            messagebox.showwarning("경고", "데이터 없음")
            return
        f = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV", "*.csv")])
        if f:
            with open(f, 'w', encoding='utf-8-sig', newline='') as file:
                w = csv.writer(file)
                w.writerow(['번호', '법원', '매각기관', '제목', '조회수', '링크'])
                w.writerows(self.notices)
            messagebox.showinfo("완료", "저장됨!")
    
    def clear(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        self.notices, self.filtered_count, self.total_count = [], 0, 0
        self.count_label.config(text="총 0건")

if __name__ == "__main__":
    root = tk.Tk()
    CourtSearchApp(root)
    root.mainloop()
