/* Trang tài liệu SAHA gửi quý khách — dựng từ danh-muc.json. Sinh bởi ~/.claude/tools/trang_tai_lieu/dung_trang.py, không sửa tay trên GitHub.
   Trình xem: ảnh từng trang (không có file PDF trên máy chủ, không nút tải), mở sẵn 125%. */
(function () {
  "use strict";
  var GOC = (window.SAHA_GOC || "./").replace(/\/?$/, "/");
  var ZOOM_MAC_DINH = 1.25, ZOOM_MIN = 0.75, ZOOM_MAX = 3;
  /* Số hotline: MỘT chỗ duy nhất. Bản SALES (dung_trang.py --ban-sales) ghi đè dòng này thành "" khi sinh site →
     không còn số, không còn nút gọi/Zalo, không còn khối Hotline. Bản thường giữ nguyên hành vi cũ. */
  var SDT = "";
  var SDT_HIEN = SDT.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1.$2.$3");
  var app = document.getElementById("app");
  var DM = null, the_theo_ma = {};

  function e(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function so(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function anhTrang(sha, i) { return GOC + "trang/" + sha + "/" + String(i).padStart(3, "0") + ".webp"; }
  function anhBia(sha) { return GOC + "trang/" + sha + "/bia.webp"; }
  function anhNen(ma) { return GOC + "nen/" + ma + ".webp"; }

  /* ── Đầu trang + chân trang riêng cho FXF và CSA (theo brand guideline 11/10/2026) ── */
  var THANG = function (d) { var m = String(d.phien_ban || ""); return m.length >= 6 ? +m.slice(4, 6) + "/" + m.slice(0, 4) : ""; };
  var NHA_MAY = [["kho-ke", "Kho kệ hàng"], ["pha-che", "Khu phối chế"], ["dong-goi", "Chiết rót · đóng gói"], ["bon-chua", "Bồn phối trộn"], ["kho-phuy", "Kho nguyên liệu"]];

  function heroFxf(d) {
    var chip = d.cay.map(function (c, i) {
      return '<a href="#xem/' + e(c.the) + '" data-mo="' + e(c.the) + '" style="--i:' + i + '"><i style="background-image:url(\'' + anhNen(c.anh) + '\')"></i><span>' + e(c.ten) + "</span></a>";
    }).join("");
    return '<header class="hero hero-fxf"><div class="fx-anh" style="background-image:url(\'' + anhNen("hero") + '\')"></div><div class="fx-nang" aria-hidden="true"></div>'
      + '<div class="khung fx-nd"><div class="fx-the">'
      + '<span class="fx-sticker">Cập nhật tháng ' + e(THANG(d)) + "</span>"
      + "<h1>Tài liệu <b>FXF</b><br>kính gửi quý khách</h1>"
      + '<p class="mo">Hồ sơ năng lực 4 thứ tiếng và tài liệu kỹ thuật theo 7 cây trồng.</p>'
      + '<div class="fx-so"><span><b>' + d.so_tai_lieu + "</b> tài liệu</span><span><b>" + so(d.tong_trang) + "</b> trang</span><span><b>" + d.so_ngon_ngu + "</b> thứ tiếng</span></div>"
      + '<div class="fx-nut"><a class="fx-chinh" href="#n1">Xem tài liệu <span aria-hidden="true">↓</span></a>' + (SDT ? '<a class="fx-phu" href="tel:' + SDT + '">Gọi ' + SDT_HIEN + "</a>" : "") + "</div>"
      + '</div><div class="fx-logo"><img src="' + GOC + e(d.th.logo) + '" alt="FXF"></div></div>'
      + '<div class="khung"><div class="fx-cay"><div class="fx-cay-tieu">Kỹ thuật theo cây — bấm để xem</div><div class="fx-cay-ds">' + chip + "</div></div></div></header>";
  }

  function heroCsa(d) {
    var chip = d.cay.map(function (c, i) {
      return '<a href="#xem/' + e(c.the) + '" data-mo="' + e(c.the) + '"><em>' + String(i + 1).padStart(2, "0") + "</em>" + e(c.ten) + "</a>";
    }).join("");
    var dai = NHA_MAY.map(function (x, i) {
      return '<figure style="--i:' + i + '"><div style="background-image:url(\'' + anhNen(x[0]) + '\')"></div><figcaption><em>' + String(i + 1).padStart(2, "0") + "</em>" + e(x[1]) + "</figcaption></figure>";
    }).join("");
    return '<header class="hero hero-csa"><div class="cs-anh" style="background-image:url(\'' + anhNen("hero") + '\')"><span class="cs-quet" aria-hidden="true"></span></div>'
      + '<div class="cs-khoi"><div class="cs-nd">'
      + '<div class="cs-logo"><img src="' + GOC + e(d.th.logo) + '" alt="CSA"></div>'
      + '<div class="cs-mono">Hồ sơ nhà máy · Kỹ thuật · ' + e(THANG(d)) + "</div>"
      + "<h1>Tài liệu <span>Nhà máy CSA</span><br>kính gửi quý khách</h1><div class=\"cs-vach\"></div>"
      + '<p class="mo">Hồ sơ năng lực 4 thứ tiếng và tài liệu kỹ thuật sản phẩm theo 7 cây trồng, 3 thứ tiếng.</p>'
      + '<div class="cs-so"><div><b data-dem="' + d.so_tai_lieu + '">' + d.so_tai_lieu + "</b><i>Tài liệu</i></div><div><b data-dem=\"" + d.tong_trang + '">' + so(d.tong_trang) + "</b><i>Trang</i></div>"
      + '<div><b data-dem="' + d.cay.length + '">' + d.cay.length + "</b><i>Cây trồng</i></div><div><b data-dem=\"" + d.so_ngon_ngu + '">' + d.so_ngon_ngu + "</b><i>Thứ tiếng</i></div></div>"
      + '<a class="cs-nut" href="#n1">Xem tài liệu <span aria-hidden="true">→</span></a>'
      + '<div class="cs-cay">' + chip + "</div></div></div></header>"
      + '<section class="cs-dai" aria-label="Nhà máy CSA"><div class="khung"><div class="cs-dai-ds">' + dai + "</div></div></section>";
  }

  function chanThuongHieu(d) {
    var t = d.th, dt = t.doi_tac;
    return '<footer class="chan chan-' + e(t.kieu) + '"><div class="khung"><div class="o-logo-chan"><img src="' + GOC + e(t.logo) + '" alt="' + e(t.ten) + '"></div><div>'
      + lienHeLh() + '<div class="hang">' + lienHeNut()
      + (t.web ? '<a href="' + e(t.web) + '" target="_blank" rel="noopener">Website ' + e(t.web_ten) + "</a>" : "") + "</div>"
      + '<div class="ngay">Cập nhật ' + e(d.ngay) + "</div></div></div>"
      + (dt ? '<div class="khung"><a class="doi-tac" href="' + e(dt.url) + '" target="_blank" rel="noopener"><b>' + e(dt.ten) + "</b><span>" + e(dt.mo) + " — xem tài liệu nhà máy</span><i aria-hidden=\"true\">→</i></a></div>" : "")
      + "</footer>";
  }

  function lienHeLh() { return SDT ? '<div class="lh">Hotline · Zalo tư vấn và đặt hàng</div><a class="hl" href="tel:' + SDT + '">' + SDT_HIEN + "</a>" : ""; }
  function lienHeNut() { return SDT ? '<a href="tel:' + SDT + '">Gọi ngay</a><a href="https://zalo.me/' + SDT + '" target="_blank" rel="noopener">Nhắn Zalo</a>' : ""; }

  function demSo() { // CSA: số chạy từ 0 khi trang mở
    document.querySelectorAll("[data-dem]").forEach(function (el) {
      var dich = +el.getAttribute("data-dem"), t0 = null, ms = 1400;
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      function b(ts) { t0 = t0 || ts; var k = Math.min(1, (ts - t0) / ms), v = Math.round(dich * (1 - Math.pow(1 - k, 3))); el.textContent = so(v); if (k < 1) requestAnimationFrame(b); }
      requestAnimationFrame(b);
    });
  }

  /* ── Trang chính ─────────────────────────────── */
  function dung(d) {
    DM = d; the_theo_ma = {};
    var K = (d.th && d.th.kieu) || "saha";
    var h = "";
    if (K === "fxf") h += heroFxf(d);
    else if (K === "csa") h += heroCsa(d);
    else {
    // hero
    var tranh = d.nen_hero.map(function (m) { return '<div style="background-image:url(\'' + anhNen(m) + '\')"></div>'; }).join("");
    var chip = d.cay.map(function (c) {
      return '<a href="#xem/' + e(c.the) + '" data-mo="' + e(c.the) + '"><i style="background-image:url(\'' + anhNen(c.anh) + '\')"></i>' + e(c.ten) + "</a>";
    }).join("");
    h += '<header class="hero"><div class="tranh" aria-hidden="true">' + tranh + '</div><div class="hero-nd">'
      + '<div class="logo-khung" style="--logo:url(\'' + GOC + 'logo-saha.webp\')"><span class="vong"></span><img class="logo-lon" src="' + GOC + 'logo-saha.webp" alt="SAHA GROUP" width="472" height="472"><span class="lua-sang"></span></div>'
      + "<h1>" + ((d.th && d.th.h1) || "Tài liệu <b>SAHA</b><br>kính gửi quý khách") + "</h1>"
      + '<p class="mo">' + e((d.th && d.th.mo) || "Hàng khuyến mãi chuyển kho, danh mục làm lô phân phối, cẩm nang mùa vụ, tài liệu kỹ thuật tham khảo.") + "</p>"
      + '<div class="so-lieu"><span><b>' + d.so_tai_lieu + "</b> tài liệu</span><span><b>" + so(d.tong_trang) + "</b> trang</span><span><b>" + d.so_ngon_ngu + "</b> thứ tiếng</span></div>"
      + '<a class="nut-vang" href="#n1">Xem tài liệu <span aria-hidden="true">↓</span></a>'
      + '<div class="cay-chip">' + chip + "</div></div></header>";
    }
    // mục
    h += '<nav class="muc"><div class="khung">' + d.nhom.map(function (n, i) { return '<a href="#n' + (i + 1) + '">' + e(n.ten) + "</a>"; }).join("") + "</div></nav>";
    h += '<main class="khung">';
    d.nhom.forEach(function (n, i) {
      h += '<section class="nhom" id="n' + (i + 1) + '"><div class="dau-nhom"' + (n.anh ? ' style="background-image:url(\'' + anhNen(n.anh) + '\')"' : "") + "><div>"
        + (K === "csa" ? '<span class="so-nhom">' + String(i + 1).padStart(2, "0") + " / " + String(d.nhom.length).padStart(2, "0") + "</span>" : "")
        + "<h2>" + e(n.ten) + "<small>" + n.the.length + " tài liệu</small></h2>" + (n.mo_ta ? "<p>" + e(n.mo_ta) + "</p>" : "") + '</div></div><div class="luoi' + (n.the.length === 1 ? " mot" : n.the.length === 2 ? " it" : "") + '">';
      n.the.forEach(function (t) {
        the_theo_ma[t.ma] = t;
        var b = t.ban[0];
        var ngu = t.ban.length > 1 ? '<div class="ngu" role="group" aria-label="Chọn ngôn ngữ">' + t.ban.map(function (x, j) {
          return '<button type="button" data-the="' + e(t.ma) + '" data-ban="' + j + '"' + (j ? "" : ' class="dang"') + ">" + e(x.ngon_ngu) + "</button>";
        }).join("") + "</div>" : "";
        h += '<article class="the" id="the-' + e(t.ma) + '"><button class="bia" type="button" style="--bia:url(\'' + anhBia(b.sha) + '\')" data-mo="' + e(t.ma) + '" aria-label="Xem ' + e(t.tieu_de) + '">'
          + '<img src="' + anhBia(b.sha) + '" alt="" loading="lazy" decoding="async" width="640" height="480">'
          + '<span class="so-trang">' + b.so_trang + ' trang</span><span class="mat"></span><span class="xem-nhanh">Xem ngay</span></button>'
          + '<div class="nd"><h3>' + e(t.tieu_de) + "</h3>" + (t.mo_ta ? "<p>" + e(t.mo_ta) + "</p>" : "") + ngu
          + '<button class="xem" type="button" data-mo="' + e(t.ma) + '">Xem tài liệu <span aria-hidden="true">→</span></button></div></article>';
      });
      h += "</div></section>";
    });
    h += "</main>";
    if (K !== "saha") h += chanThuongHieu(d);
    else h += '<footer class="chan"><div class="khung"><img src="' + GOC + 'logo-saha.webp" alt="SAHA GROUP" width="472" height="472"><div>'
      + lienHeLh() + '<div class="hang">' + lienHeNut()
      + '<a href="https://hethongsaha.com/san-pham" target="_blank" rel="noopener">Xem sản phẩm SAHA</a></div>'
      + '<div class="ngay">Cập nhật ' + e(d.ngay) + "</div></div></div>"
      + '<div class="khung bo-logo">' + [["saha", "SAHA GROUP"], ["fxf", "FXF"], ["csa", "Nhà máy CSA"]].map(function (x) {
        return '<div class="o-logo"><img src="' + GOC + "logo-" + x[0] + '.webp" alt="' + x[1] + '" loading="lazy"></div>';
      }).join("") + "</div></footer>";
    app.innerHTML = h;
    if (K === "csa") demSo();
    app.addEventListener("contextmenu", function (ev) { if (ev.target.closest(".bia")) ev.preventDefault(); });

    app.addEventListener("click", function (ev) {
      var nb = ev.target.closest("[data-ban]");
      if (nb) { // đổi ngôn ngữ trên thẻ
        var t = the_theo_ma[nb.getAttribute("data-the")], j = +nb.getAttribute("data-ban"), the = nb.closest(".the");
        the.querySelectorAll(".ngu button").forEach(function (x, k) { x.classList.toggle("dang", k === j); });
        the.querySelector(".bia img").src = anhBia(t.ban[j].sha);
        the.querySelector(".bia").style.setProperty("--bia", "url('" + anhBia(t.ban[j].sha) + "')");
        the.querySelector(".so-trang").textContent = t.ban[j].so_trang + " trang";
        the.setAttribute("data-chon", j);
        return;
      }
      var m = ev.target.closest("[data-mo]");
      if (m) {
        ev.preventDefault();
        var ma = m.getAttribute("data-mo"), th = document.getElementById("the-" + ma);
        moXem(ma, th ? +(th.getAttribute("data-chon") || 0) : 0, true);
      }
    });
    theoDoiMuc();
    tuHash();
  }

  function theoDoiMuc() {
    var links = Array.prototype.slice.call(document.querySelectorAll("nav.muc a"));
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (ds) {
      ds.forEach(function (x) {
        if (!x.isIntersecting) return;
        links.forEach(function (a) {
          var dung_cho = a.getAttribute("href") === "#" + x.target.id;
          a.classList.toggle("dang", dung_cho);
          if (dung_cho) { var k = a.parentNode; k.scrollTo({ left: a.offsetLeft - k.offsetLeft - (k.clientWidth - a.offsetWidth) / 2, behavior: "smooth" }); }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("section.nhom").forEach(function (s) { io.observe(s); });
  }

  /* ── Trình xem ───────────────────────────────── */
  var lop = null, zoom = ZOOM_MAC_DINH, dangXem = null;

  function rongGoc() { return Math.min(window.innerWidth - 16, 1100); }

  function moXem(ma, j, dayLichSu) {
    var t = the_theo_ma[ma]; if (!t) return;
    j = Math.max(0, Math.min(j || 0, t.ban.length - 1));
    var b = t.ban[j];
    dangXem = { ma: ma, j: j };
    zoom = ZOOM_MAC_DINH;
    if (dayLichSu) history.pushState({ xem: ma, ban: j }, "", "#xem/" + ma + (j ? "/" + j : ""));
    if (!lop) {
      lop = document.createElement("div");
      lop.className = "xem-lop";
      lop.setAttribute("role", "dialog");
      lop.setAttribute("aria-modal", "true");
      document.body.appendChild(lop);
      lop.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
      lop.addEventListener("dragstart", function (ev) { ev.preventDefault(); });
    }
    var ngu = t.ban.length > 1 ? '<div class="ngu">' + t.ban.map(function (x, k) {
      return '<button type="button" data-k="' + k + '"' + (k === j ? ' class="dang"' : "") + ">" + e(x.ngon_ngu) + "</button>";
    }).join("") + "</div>" : "";
    var anh = "";
    for (var i = 1; i <= b.so_trang; i++) {
      anh += '<img src="' + anhTrang(b.sha, i) + '" alt="Trang ' + i + '" width="' + b.rong + '" height="' + b.cao + '" draggable="false"'
        + (i <= 2 ? "" : ' loading="lazy"') + ' decoding="async" data-i="' + i + '">';
    }
    lop.innerHTML = '<div class="xem-dau"><button class="dong" type="button" aria-label="Đóng">← Đóng</button>'
      + '<div class="ten"><b>' + e(t.tieu_de) + "</b><span>" + b.so_trang + " trang · " + e(b.ngon_ngu) + "</span></div>" + ngu + "</div>"
      + '<div class="xem-than"><div class="xem-giay">' + anh + "</div></div>"
      + '<div class="xem-cong"><button type="button" data-z="-" aria-label="Thu nhỏ">−</button><span class="tl"></span>'
      + '<button type="button" data-z="+" aria-label="Phóng to">+</button><button type="button" class="vua" data-z="0">Vừa màn hình</button>'
      + '<span class="tr">Trang <b class="so">1</b>/' + b.so_trang + "</span></div>";
    document.body.classList.add("dang-xem");
    datZoom(zoom, true);
    lop.querySelector(".dong").onclick = function () { history.state && history.state.xem ? history.back() : dongXem(); };
    lop.querySelectorAll(".xem-dau .ngu button").forEach(function (x) {
      x.onclick = function () { var k = +x.getAttribute("data-k"); history.replaceState({ xem: ma, ban: k }, "", "#xem/" + ma + (k ? "/" + k : "")); moXem(ma, k, false); };
    });
    lop.querySelectorAll(".xem-cong [data-z]").forEach(function (x) {
      x.onclick = function () {
        var z = x.getAttribute("data-z");
        datZoom(z === "+" ? zoom + 0.25 : z === "-" ? zoom - 0.25 : 1);
      };
    });
    var than = lop.querySelector(".xem-than"), soEl = lop.querySelector(".so");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ds) {
        ds.forEach(function (x) { if (x.isIntersecting) soEl.textContent = x.target.getAttribute("data-i"); });
      }, { root: than, rootMargin: "-45% 0px -50% 0px" });
      lop.querySelectorAll(".xem-giay img").forEach(function (im) { io.observe(im); });
    }
    than.scrollTop = 0;
    than.setAttribute("tabindex", "-1");
    if (window.innerWidth < 700) { // điện thoại: 125 % rộng hơn màn hình → nhắc kéo ngang
      var gy = document.createElement("div");
      gy.className = "goi-y";
      gy.textContent = "Chữ đã phóng to 125%. Kéo ngang để xem hết trang, hoặc bấm “Vừa màn hình”.";
      lop.appendChild(gy);
      setTimeout(function () { gy.style.opacity = "0"; }, 4200);
      setTimeout(function () { gy.remove(); }, 4700);
    }
  }

  function datZoom(z, dau) {
    if (!lop) return;
    var than = lop.querySelector(".xem-than"), giay = lop.querySelector(".xem-giay");
    var tyLeDoc = than.scrollHeight ? (than.scrollTop + than.clientHeight / 2) / than.scrollHeight : 0;
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z * 100) / 100));
    giay.style.width = Math.round(rongGoc() * zoom) + "px";
    lop.querySelector(".tl").textContent = Math.round(zoom * 100) + "%";
    if (!dau) {
      than.scrollTop = tyLeDoc * than.scrollHeight - than.clientHeight / 2;
      than.scrollLeft = (than.scrollWidth - than.clientWidth) / 2;
    } else {
      than.scrollLeft = (than.scrollWidth - than.clientWidth) / 2;
    }
  }

  function dongXem() {
    if (!lop) return;
    lop.remove(); lop = null; dangXem = null;
    document.body.classList.remove("dang-xem");
  }

  function tuHash() {
    var m = location.hash.match(/^#xem\/([\w-]+)(?:\/(\d+))?/);
    if (m && the_theo_ma[m[1]]) moXem(m[1], +(m[2] || 0), false);
    else if (lop) dongXem();
  }

  window.addEventListener("popstate", tuHash);
  window.addEventListener("resize", function () { if (lop) datZoom(zoom, true); });
  document.addEventListener("keydown", function (ev) {
    if (!lop) return;
    if (ev.key === "Escape") { history.state && history.state.xem ? history.back() : dongXem(); }
    else if (ev.key === "+" || ev.key === "=") datZoom(zoom + 0.25);
    else if (ev.key === "-") datZoom(zoom - 0.25);
    else if ((ev.ctrlKey || ev.metaKey) && (ev.key === "s" || ev.key === "p")) ev.preventDefault();
  });

  fetch(GOC + "danh-muc.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(dung)
    .catch(function () {
      app.innerHTML = '<div style="padding:60px 20px;text-align:center;font:18px/1.6 sans-serif;color:#2a2418">Không tải được danh sách tài liệu. Quý khách vui lòng tải lại trang' + (SDT ? ' hoặc gọi Hotline · Zalo <a href="tel:' + SDT + '">' + SDT_HIEN + "</a>" : "") + ".</div>";
    });
})();
