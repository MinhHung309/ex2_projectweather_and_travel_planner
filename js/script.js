/**
 * WEATHER & TRAVEL PLANNER - JAVASCRIPT (ES6+ Vanilla)
 * Modules:
 * 1. Storage Module
 * 2. Weather & Theme Module
 * 3. Smart Suggestions Module
 * 4. Itinerary Module (CRUD, Safe DOM, Animation)
 * 5. Search, Filter, Sort, Pagination Module
 * 6. Countdown Timer Module
 * 7. Export to Text (.txt) Module
 * 8. Notification & Init Module
 */

(function () {
  "use strict";

  /* ==========================================================================
     CONSTANTS & MOCK DATA
     ========================================================================== */
  const STORAGE_KEYS = {
    SELECTED_CITY: "wtp_selected_city_id",
    ITINERARY_LIST: "wtp_itinerary_items",
    DEPARTURE_DATE: "wtp_departure_date"
  };

  // Dữ liệu mô phỏng thời tiết cho tối thiểu 3 thành phố
  const CITIES_DATA = [
    {
      id: "bien-hoa",
      name: "Biên Hòa",
      temperature: 33,
      humidity: 68,
      windSpeed: 14,
      condition: "Nắng nhiều",
      conditionType: "sunny", // 'sunny' | 'rainy' | 'cloudy'
      icon: "☀️",
      description: "Thời tiết nắng nóng ban ngày, độ ẩm trung bình, chiều tối có thể có gió nhẹ."
    },
    {
      id: "da-lat",
      name: "Đà Lạt",
      temperature: 17,
      humidity: 86,
      windSpeed: 12,
      condition: "Mưa phùn & Se lạnh",
      conditionType: "rainy",
      icon: "🌧️",
      description: "Không khí se lạnh, sương mù sáng sớm và có mưa phùn rải rác."
    },
    {
      id: "vung-tau",
      name: "Vũng Tàu",
      temperature: 28,
      humidity: 78,
      windSpeed: 22,
      condition: "Nhiều mây & Gió biển",
      conditionType: "cloudy",
      icon: "⛅",
      description: "Gió biển mát mẻ, trời nhiều mây râm mát, thích hợp dạo biển."
    }
  ];

  /* ==========================================================================
     APPLICATION STATE
     ========================================================================== */
  const state = {
    selectedCityId: CITIES_DATA[0].id,
    itineraryList: [], // Danh sách gốc: { id, title, time, visited, createdAt }
    departureDate: "",
    filters: {
      searchQuery: "",
      status: "all", // 'all' | 'unvisited' | 'visited'
      sortBy: "name-asc", // 'name-asc' | 'name-desc' | 'time-asc' | 'created-desc'
      pageSize: 10, // 10 | 20 | 50 | 'all'
      currentPage: 1
    },
    countdownIntervalId: null
  };

  /* ==========================================================================
     DOM ELEMENTS CACHE
     ========================================================================== */
  const dom = {};

  function cacheDomElements() {
    // Weather
    dom.citySelect = document.getElementById("citySelect");
    dom.weatherCard = document.getElementById("weatherCard");
    dom.weatherIcon = document.getElementById("weatherIcon");
    dom.weatherTemp = document.getElementById("weatherTemp");
    dom.weatherCondition = document.getElementById("weatherCondition");
    dom.weatherHumidity = document.getElementById("weatherHumidity");
    dom.weatherWind = document.getElementById("weatherWind");
    dom.weatherDesc = document.getElementById("weatherDesc");
    dom.suggestionsList = document.getElementById("suggestionsList");

    // Itinerary Form
    dom.addLocationForm = document.getElementById("addLocationForm");
    dom.locationTitleInput = document.getElementById("locationTitleInput");
    dom.locationTimeInput = document.getElementById("locationTimeInput");
    dom.locationTitleError = document.getElementById("locationTitleError");

    // Toolbar Controls
    dom.searchInput = document.getElementById("searchInput");
    dom.clearSearchBtn = document.getElementById("clearSearchBtn");
    dom.statusFilter = document.getElementById("statusFilter");
    dom.sortBy = document.getElementById("sortBy");
    dom.pageSizeSelect = document.getElementById("pageSizeSelect");

    // Stats
    dom.statsTotalCount = document.getElementById("statsTotalCount");
    dom.statsProgress = document.getElementById("statsProgress");

    // Itinerary List & States
    dom.itineraryList = document.getElementById("itineraryList");
    dom.emptyState = document.getElementById("emptyState");
    dom.noResultsState = document.getElementById("noResultsState");
    dom.resetFilterBtn = document.getElementById("resetFilterBtn");

    // Pagination
    dom.paginationNav = document.getElementById("paginationNav");
    dom.pageCurrentRange = document.getElementById("pageCurrentRange");
    dom.pageTotalItems = document.getElementById("pageTotalItems");
    dom.prevPageBtn = document.getElementById("prevPageBtn");
    dom.nextPageBtn = document.getElementById("nextPageBtn");
    dom.pageNumbers = document.getElementById("pageNumbers");

    // Countdown & Export
    dom.departureDatePicker = document.getElementById("departureDatePicker");
    dom.countdownDisplay = document.getElementById("countdownDisplay");
    dom.exportBtn = document.getElementById("exportBtn");

    // Toast
    dom.toastNotification = document.getElementById("toastNotification");
  }

  /* ==========================================================================
     1. STORAGE MODULE
     ========================================================================== */
  const StorageModule = {
    isAvailable: function () {
      try {
        const testKey = "__storage_test__";
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },

    save: function (key, data) {
      if (!this.isAvailable()) return;
      try {
        window.localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error(`Lỗi khi lưu dữ liệu vào LocalStorage (${key}):`, err);
        UIModule.showToast("Không thể lưu trạng thái vào trình duyệt!", "error");
      }
    },

    load: function (key, defaultValue) {
      if (!this.isAvailable()) return defaultValue;
      try {
        const serialized = window.localStorage.getItem(key);
        if (serialized === null) return defaultValue;
        return JSON.parse(serialized);
      } catch (err) {
        console.warn(`Dữ liệu LocalStorage (${key}) không hợp lệ hoặc bị hỏng:`, err);
        return defaultValue;
      }
    },

    saveSelectedCity: function (cityId) {
      this.save(STORAGE_KEYS.SELECTED_CITY, cityId);
    },

    loadSelectedCity: function () {
      return this.load(STORAGE_KEYS.SELECTED_CITY, CITIES_DATA[0].id);
    },

    saveItinerary: function (items) {
      this.save(STORAGE_KEYS.ITINERARY_LIST, items);
    },

    loadItinerary: function () {
      const items = this.load(STORAGE_KEYS.ITINERARY_LIST, []);
      if (!Array.isArray(items)) return [];
      return items;
    },

    saveDepartureDate: function (dateStr) {
      this.save(STORAGE_KEYS.DEPARTURE_DATE, dateStr);
    },

    loadDepartureDate: function () {
      return this.load(STORAGE_KEYS.DEPARTURE_DATE, "");
    }
  };

  /* ==========================================================================
     2. WEATHER & THEME MODULE
     ========================================================================== */
  const WeatherModule = {
    init: function () {
      this.populateCityDropdown();
      const savedCityId = StorageModule.loadSelectedCity();
      const cityExists = CITIES_DATA.some(c => c.id === savedCityId);
      state.selectedCityId = cityExists ? savedCityId : CITIES_DATA[0].id;
      dom.citySelect.value = state.selectedCityId;
      this.updateDisplay(state.selectedCityId);

      dom.citySelect.addEventListener("change", (e) => {
        state.selectedCityId = e.target.value;
        StorageModule.saveSelectedCity(state.selectedCityId);
        this.updateDisplay(state.selectedCityId);
        UIModule.showToast(`Đã chuyển sang thành phố: ${this.getCurrentCity().name}`, "info");
      });
    },

    getCurrentCity: function () {
      return CITIES_DATA.find(c => c.id === state.selectedCityId) || CITIES_DATA[0];
    },

    populateCityDropdown: function () {
      dom.citySelect.innerHTML = "";
      CITIES_DATA.forEach(city => {
        const option = document.createElement("option");
        option.value = city.id;
        option.textContent = `${city.name} (${city.temperature}°C - ${city.condition})`;
        dom.citySelect.appendChild(option);
      });
    },

    updateDisplay: function (cityId) {
      const city = CITIES_DATA.find(c => c.id === cityId) || CITIES_DATA[0];

      // Update text & details
      dom.weatherIcon.textContent = city.icon;
      dom.weatherTemp.textContent = `${city.temperature}°C`;
      dom.weatherCondition.textContent = city.condition;
      dom.weatherHumidity.textContent = `${city.humidity}%`;
      dom.weatherWind.textContent = `${city.windSpeed} km/h`;
      dom.weatherDesc.textContent = city.description;

      // Update Theme Class on Body
      document.body.classList.remove("theme-sunny", "theme-rainy", "theme-cloudy");
      if (city.conditionType === "sunny") {
        document.body.classList.add("theme-sunny");
      } else if (city.conditionType === "rainy") {
        document.body.classList.add("theme-rainy");
      } else if (city.conditionType === "cloudy") {
        document.body.classList.add("theme-cloudy");
      }

      // Update Smart Suggestions
      SmartSuggestionsModule.render(city);
    }
  };

  /* ==========================================================================
     3. SMART SUGGESTIONS MODULE
     ========================================================================== */
  const SmartSuggestionsModule = {
    generateSuggestions: function (city) {
      const suggestions = [];

      // 1. Phân loại theo nhiệt độ (Quy tắc bắt buộc)
      if (city.temperature < 15) {
        suggestions.push({
          icon: "🧥",
          text: "Nhiệt độ dưới 15°C: Thời tiết rất lạnh, bạn nhớ chuẩn bị áo khoác ấm, khăn quàng cổ và giữ ấm cơ thể."
        });
      } else if (city.temperature >= 15 && city.temperature < 20) {
        suggestions.push({
          icon: "🧣",
          text: "Nhiệt độ từ 15°C đến dưới 20°C: Không khí se lạnh, thích hợp mang theo áo khoác nhẹ hoặc cardigan."
        });
      } else if (city.temperature >= 20 && city.temperature <= 30) {
        suggestions.push({
          icon: "👕",
          text: "Nhiệt độ từ 20°C đến 30°C: Thời tiết lý tưởng, nên chọn trang phục thoải mái, thấm hút mồ hôi tốt để di chuyển."
        });
      } else {
        suggestions.push({
          icon: "🧢",
          text: "Nhiệt độ trên 30°C: Nắng nóng gay gắt, hãy mang theo nước uống đầy đủ, nón/mũ rộng vành và kính râm."
        });
      }

      // 2. Phân loại theo tình trạng thời tiết (Mưa / Nhiều mây)
      if (city.conditionType === "rainy" || city.condition.toLowerCase().includes("mưa")) {
        suggestions.push({
          icon: "☂️",
          text: "Dự báo có mưa: Nhớ mang theo ô (dù), áo mưa tiện lợi hoặc túi chống nước bảo vệ thiết bị điện tử."
        });
      } else if (city.conditionType === "cloudy" || city.condition.toLowerCase().includes("mây")) {
        suggestions.push({
          icon: "📸",
          text: "Trời nhiều mây râm mát: Thời điểm tuyệt vời để chụp ảnh ngoại cảnh và tham quan các điểm du lịch ngoài trời."
        });
      } else if (city.conditionType === "sunny") {
        suggestions.push({
          icon: "🧴",
          text: "Trời nắng trong: Đừng quên thoa kem chống nắng bảo vệ da trước khi khởi hành 20 phút."
        });
      }

      return suggestions;
    },

    render: function (city) {
      const list = this.generateSuggestions(city);
      dom.suggestionsList.innerHTML = "";

      list.forEach(item => {
        const li = document.createElement("li");
        li.className = "suggestion-item";

        const iconSpan = document.createElement("span");
        iconSpan.className = "suggestion-item-icon";
        iconSpan.setAttribute("aria-hidden", "true");
        iconSpan.textContent = item.icon;

        const textSpan = document.createElement("span");
        textSpan.textContent = item.text;

        li.appendChild(iconSpan);
        li.appendChild(textSpan);
        dom.suggestionsList.appendChild(li);
      });
    }
  };

  /* ==========================================================================
     4. ITINERARY MODULE (CRUD, DOM AN TOÀN, ANIMATION)
     ========================================================================== */
  const ItineraryModule = {
    init: function () {
      state.itineraryList = StorageModule.loadItinerary();

      // Sự kiện submit form
      dom.addLocationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddLocation();
      });

      // Clear lỗi khi gõ
      dom.locationTitleInput.addEventListener("input", () => {
        this.clearError();
      });

      // Event delegation trên danh sách địa điểm
      dom.itineraryList.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete");
        const toggleBtn = e.target.closest(".btn-toggle-visited");
        const checkbox = e.target.closest(".item-checkbox");

        if (deleteBtn) {
          const itemId = deleteBtn.getAttribute("data-id");
          this.deleteItem(itemId);
        } else if (toggleBtn || checkbox) {
          const target = toggleBtn || checkbox;
          const itemId = target.getAttribute("data-id");
          this.toggleVisited(itemId);
        }
      });
    },

    handleAddLocation: function () {
      const titleRaw = dom.locationTitleInput.value;
      const titleTrimmed = titleRaw.trim();
      const timeVal = dom.locationTimeInput.value || "Trong ngày";

      if (!titleTrimmed) {
        this.showError("Vui lòng nhập tên địa điểm ghé thăm!");
        dom.locationTitleInput.focus();
        return;
      }

      this.clearError();

      const newItem = {
        id: "loc_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        title: titleTrimmed,
        time: timeVal,
        visited: false,
        createdAt: new Date().toISOString()
      };

      state.itineraryList.unshift(newItem);
      StorageModule.saveItinerary(state.itineraryList);

      // Reset form
      dom.locationTitleInput.value = "";
      dom.locationTimeInput.value = "";
      dom.locationTitleInput.focus();

      UIModule.showToast(`Đã thêm địa điểm "${titleTrimmed}" vào lịch trình!`, "success");

      // Cập nhật hiển thị (tự động điều chỉnh phân trang về hợp lệ)
      FilterSortPaginationModule.applyAndRender();
    },

    toggleVisited: function (id) {
      const item = state.itineraryList.find(loc => loc.id === id);
      if (!item) return;

      item.visited = !item.visited;
      StorageModule.saveItinerary(state.itineraryList);

      const statusText = item.visited ? "Đã đến" : "Chưa đến";
      UIModule.showToast(`Cập nhật trạng thái: "${item.title}" -> ${statusText}`, "info");

      FilterSortPaginationModule.applyAndRender();
    },

    deleteItem: function (id) {
      const itemIndex = state.itineraryList.findIndex(loc => loc.id === id);
      if (itemIndex === -1) return;

      const item = state.itineraryList[itemIndex];
      const itemElement = dom.itineraryList.querySelector(`[data-item-id="${id}"]`);

      // Hiệu ứng animation xóa trước khi loại bỏ khỏi dữ liệu
      if (itemElement) {
        itemElement.classList.add("is-deleting");
        setTimeout(() => {
          this.confirmDeleteItem(id, item.title);
        }, 250);
      } else {
        this.confirmDeleteItem(id, item.title);
      }
    },

    confirmDeleteItem: function (id, title) {
      state.itineraryList = state.itineraryList.filter(loc => loc.id !== id);
      StorageModule.saveItinerary(state.itineraryList);
      UIModule.showToast(`Đã xóa "${title}" khỏi lịch trình!`, "error");
      FilterSortPaginationModule.applyAndRender();
    },

    showError: function (msg) {
      dom.locationTitleError.textContent = msg;
      dom.locationTitleInput.setAttribute("aria-invalid", "true");
    },

    clearError: function () {
      dom.locationTitleError.textContent = "";
      dom.locationTitleInput.removeAttribute("aria-invalid");
    }
  };

  /* ==========================================================================
     5. SEARCH, FILTER, SORT & PAGINATION MODULE
     ========================================================================== */
  const FilterSortPaginationModule = {
    init: function () {
      // Tìm kiếm
      dom.searchInput.addEventListener("input", (e) => {
        state.filters.searchQuery = e.target.value.trim().toLowerCase();
        state.filters.currentPage = 1; // Luôn reset về trang 1
        if (state.filters.searchQuery) {
          dom.clearSearchBtn.classList.remove("hidden");
        } else {
          dom.clearSearchBtn.classList.add("hidden");
        }
        this.applyAndRender();
      });

      dom.clearSearchBtn.addEventListener("click", () => {
        dom.searchInput.value = "";
        state.filters.searchQuery = "";
        state.filters.currentPage = 1;
        dom.clearSearchBtn.classList.add("hidden");
        dom.searchInput.focus();
        this.applyAndRender();
      });

      // Lọc trạng thái
      dom.statusFilter.addEventListener("change", (e) => {
        state.filters.status = e.target.value;
        state.filters.currentPage = 1;
        this.applyAndRender();
      });

      // Sắp xếp
      dom.sortBy.addEventListener("change", (e) => {
        state.filters.sortBy = e.target.value;
        state.filters.currentPage = 1;
        this.applyAndRender();
      });

      // Kích thước trang
      dom.pageSizeSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        state.filters.pageSize = val === "all" ? "all" : parseInt(val, 10);
        state.filters.currentPage = 1;
        this.applyAndRender();
      });

      // Nút phân trang Trước / Sau
      dom.prevPageBtn.addEventListener("click", () => {
        if (state.filters.currentPage > 1) {
          state.filters.currentPage--;
          this.applyAndRender();
        }
      });

      dom.nextPageBtn.addEventListener("click", () => {
        const processed = this.getProcessedData();
        const totalPages = state.filters.pageSize === "all" ? 1 : Math.ceil(processed.length / state.filters.pageSize);
        if (state.filters.currentPage < totalPages) {
          state.filters.currentPage++;
          this.applyAndRender();
        }
      });

      // Nút xóa bộ lọc khi không có kết quả
      dom.resetFilterBtn.addEventListener("click", () => {
        dom.searchInput.value = "";
        state.filters.searchQuery = "";
        dom.clearSearchBtn.classList.add("hidden");

        state.filters.status = "all";
        dom.statusFilter.value = "all";

        state.filters.sortBy = "name-asc";
        dom.sortBy.value = "name-asc";

        state.filters.currentPage = 1;
        this.applyAndRender();
      });
    },

    // Thứ tự xử lý chuẩn: Dữ liệu gốc -> Tìm kiếm -> Lọc -> Sắp xếp
    getProcessedData: function () {
      let result = [...state.itineraryList];

      // 1. Tìm kiếm (theo tên địa điểm, không phân biệt hoa thường)
      if (state.filters.searchQuery) {
        result = result.filter(item => item.title.toLowerCase().includes(state.filters.searchQuery));
      }

      // 2. Lọc (Tất cả, Chưa đến, Đã đến)
      if (state.filters.status === "visited") {
        result = result.filter(item => item.visited === true);
      } else if (state.filters.status === "unvisited") {
        result = result.filter(item => item.visited === false);
      }

      // 3. Sắp xếp (A-Z, Z-A, thời gian, mới nhất)
      result.sort((a, b) => {
        if (state.filters.sortBy === "name-asc") {
          return a.title.localeCompare(b.title, "vi", { sensitivity: "base" });
        } else if (state.filters.sortBy === "name-desc") {
          return b.title.localeCompare(a.title, "vi", { sensitivity: "base" });
        } else if (state.filters.sortBy === "time-asc") {
          return (a.time || "").localeCompare(b.time || "");
        } else if (state.filters.sortBy === "created-desc") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });

      return result;
    },

    applyAndRender: function () {
      const processed = this.getProcessedData();
      const totalFiltered = processed.length;
      const totalOriginal = state.itineraryList.length;

      // Cập nhật thống kê tiến độ
      this.renderStats(totalOriginal);

      // Xử lý Empty States
      if (totalOriginal === 0) {
        dom.itineraryList.innerHTML = "";
        dom.emptyState.classList.remove("hidden");
        dom.noResultsState.classList.add("hidden");
        dom.paginationNav.classList.add("hidden");
        return;
      }

      if (totalFiltered === 0) {
        dom.itineraryList.innerHTML = "";
        dom.emptyState.classList.add("hidden");
        dom.noResultsState.classList.remove("hidden");
        dom.paginationNav.classList.add("hidden");
        return;
      }

      // Có kết quả hợp lệ
      dom.emptyState.classList.add("hidden");
      dom.noResultsState.classList.add("hidden");
      dom.paginationNav.classList.remove("hidden");

      // Tính toán phân trang
      const pageSize = state.filters.pageSize;
      let totalPages = 1;
      let paginatedItems = processed;
      let startIndex = 0;
      let endIndex = totalFiltered;

      if (pageSize !== "all") {
        totalPages = Math.ceil(totalFiltered / pageSize) || 1;
        // Bảo đảm chỉ số trang không vượt quá tổng số trang
        if (state.filters.currentPage > totalPages) {
          state.filters.currentPage = totalPages;
        }
        if (state.filters.currentPage < 1) {
          state.filters.currentPage = 1;
        }

        startIndex = (state.filters.currentPage - 1) * pageSize;
        endIndex = Math.min(startIndex + pageSize, totalFiltered);
        paginatedItems = processed.slice(startIndex, endIndex);
      } else {
        state.filters.currentPage = 1;
      }

      // Render danh sách an toàn
      this.renderListItems(paginatedItems);

      // Render điều hướng phân trang
      this.renderPaginationControls(startIndex, endIndex, totalFiltered, totalPages);
    },

    renderStats: function (totalOriginal) {
      const visitedCount = state.itineraryList.filter(i => i.visited).length;
      const percent = totalOriginal > 0 ? Math.round((visitedCount / totalOriginal) * 100) : 0;

      dom.statsTotalCount.textContent = `Tổng cộng: ${totalOriginal} địa điểm`;
      dom.statsProgress.textContent = `Đã hoàn thành: ${visitedCount}/${totalOriginal} (${percent}%)`;
    },

    renderListItems: function (items) {
      dom.itineraryList.innerHTML = "";

      items.forEach(item => {
        const li = document.createElement("li");
        li.className = `itinerary-item ${item.visited ? "is-visited" : ""}`;
        li.setAttribute("data-item-id", item.id);

        // Nội dung chính
        const mainContent = document.createElement("div");
        mainContent.className = "item-main-content";

        // Checkbox đánh dấu
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = item.visited;
        checkbox.setAttribute("data-id", item.id);
        checkbox.setAttribute("aria-label", `Đánh dấu đã ghé thăm ${item.title}`);

        // Thông tin địa điểm
        const infoDiv = document.createElement("div");
        infoDiv.className = "item-info";

        const titleDiv = document.createElement("div");
        titleDiv.className = "item-title";
        titleDiv.textContent = item.title; // DOM an toàn chống XSS

        const metaDiv = document.createElement("div");
        metaDiv.className = "item-meta";

        const timeSpan = document.createElement("span");
        timeSpan.textContent = `🕒 ${item.time}`;

        const statusBadge = document.createElement("span");
        statusBadge.className = `badge-status ${item.visited ? "visited" : "unvisited"}`;
        statusBadge.textContent = item.visited ? "Đã đến" : "Chưa đến";

        metaDiv.appendChild(timeSpan);
        metaDiv.appendChild(statusBadge);

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(metaDiv);

        mainContent.appendChild(checkbox);
        mainContent.appendChild(infoDiv);

        // Các nút hành động
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "item-actions";

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "btn-item-action btn-toggle-visited";
        toggleBtn.setAttribute("data-id", item.id);
        toggleBtn.textContent = item.visited ? "Đánh dấu chưa đến" : "Đã đến";

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "btn-item-action btn-delete";
        deleteBtn.setAttribute("data-id", item.id);
        deleteBtn.setAttribute("aria-label", `Xóa địa điểm ${item.title}`);
        deleteBtn.textContent = "🗑️ Xóa";

        actionsDiv.appendChild(toggleBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(mainContent);
        li.appendChild(actionsDiv);

        dom.itineraryList.appendChild(li);
      });
    },

    renderPaginationControls: function (startIndex, endIndex, totalFiltered, totalPages) {
      if (totalFiltered === 0) {
        dom.pageCurrentRange.textContent = "0-0";
        dom.pageTotalItems.textContent = "0";
        dom.prevPageBtn.disabled = true;
        dom.nextPageBtn.disabled = true;
        dom.pageNumbers.innerHTML = "";
        return;
      }

      dom.pageCurrentRange.textContent = `${startIndex + 1}-${endIndex}`;
      dom.pageTotalItems.textContent = totalFiltered;

      dom.prevPageBtn.disabled = state.filters.currentPage <= 1;
      dom.nextPageBtn.disabled = state.filters.currentPage >= totalPages;

      // Nút số trang
      dom.pageNumbers.innerHTML = "";
      if (state.filters.pageSize !== "all" && totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
          const pageBtn = document.createElement("button");
          pageBtn.type = "button";
          pageBtn.className = `btn-page btn-page-number ${i === state.filters.currentPage ? "active" : ""}`;
          pageBtn.textContent = i;
          pageBtn.setAttribute("aria-label", `Đến trang ${i}`);
          if (i === state.filters.currentPage) {
            pageBtn.setAttribute("aria-current", "page");
          }
          pageBtn.addEventListener("click", () => {
            state.filters.currentPage = i;
            this.applyAndRender();
          });
          dom.pageNumbers.appendChild(pageBtn);
        }
      }
    }
  };

  /* ==========================================================================
     6. COUNTDOWN TIMER MODULE
     ========================================================================== */
  const CountdownModule = {
    init: function () {
      const savedDate = StorageModule.loadDepartureDate();
      if (savedDate) {
        state.departureDate = savedDate;
        dom.departureDatePicker.value = savedDate;
        this.startCountdown();
      }

      dom.departureDatePicker.addEventListener("change", (e) => {
        const selected = e.target.value;
        state.departureDate = selected;
        StorageModule.saveDepartureDate(selected);

        if (selected) {
          this.startCountdown();
          UIModule.showToast("Đã lưu ngày khởi hành chuyến đi!", "success");
        } else {
          this.stopCountdown();
          dom.countdownDisplay.innerHTML = `<span class="countdown-placeholder">Vui lòng chọn ngày</span>`;
        }
      });
    },

    stopCountdown: function () {
      if (state.countdownIntervalId) {
        clearInterval(state.countdownIntervalId);
        state.countdownIntervalId = null;
      }
    },

    startCountdown: function () {
      this.stopCountdown(); // Giải phóng interval cũ tránh trùng lặp rò rỉ
      this.tick(); // Chạy ngay lập tức lần đầu

      state.countdownIntervalId = setInterval(() => {
        this.tick();
      }, 1000);
    },

    tick: function () {
      if (!state.departureDate) {
        this.stopCountdown();
        return;
      }

      // Tính toán mốc 00:00:00 của ngày khởi hành theo giờ địa phương
      const targetTime = new Date(`${state.departureDate}T00:00:00`).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (isNaN(diff)) {
        dom.countdownDisplay.innerHTML = `<span class="countdown-placeholder">Ngày không hợp lệ</span>`;
        this.stopCountdown();
        return;
      }

      if (diff <= 0) {
        // Đã đến ngày khởi hành hoặc đã qua
        dom.countdownDisplay.innerHTML = `
          <div class="countdown-unit-box" style="background: rgba(39, 174, 96, 0.3);">
            <span class="countdown-num" style="color: var(--color-success);">🚀</span>
            <span class="countdown-text" style="color: var(--color-success);">CHUYẾN ĐI ĐÃ BẮT ĐẦU!</span>
          </div>
        `;
        this.stopCountdown();
        return;
      }

      // Quy đổi thời gian
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      dom.countdownDisplay.innerHTML = `
        <div class="countdown-unit-box">
          <span class="countdown-num">${days}</span>
          <span class="countdown-text">Ngày</span>
        </div>
        <div class="countdown-unit-box">
          <span class="countdown-num">${String(hours).padStart(2, "0")}</span>
          <span class="countdown-text">Giờ</span>
        </div>
        <div class="countdown-unit-box">
          <span class="countdown-num">${String(minutes).padStart(2, "0")}</span>
          <span class="countdown-text">Phút</span>
        </div>
        <div class="countdown-unit-box">
          <span class="countdown-num">${String(seconds).padStart(2, "0")}</span>
          <span class="countdown-text">Giây</span>
        </div>
      `;
    }
  };

  /* ==========================================================================
     7. EXPORT TO TEXT (.TXT) MODULE
     ========================================================================== */
  const ExportModule = {
    init: function () {
      dom.exportBtn.addEventListener("click", () => {
        this.exportItinerary();
      });
    },

    exportItinerary: function () {
      const city = WeatherModule.getCurrentCity();
      const totalItems = state.itineraryList.length;

      if (totalItems === 0) {
        UIModule.showToast("Lịch trình đang trống! Hãy thêm địa điểm trước khi xuất file.", "error");
        return;
      }

      // Xây dựng nội dung file văn bản tiếng Việt có dấu
      const exportDate = new Date().toLocaleString("vi-VN");
      let content = `====================================================\n`;
      content += `       WEATHER & TRAVEL PLANNER - LỊCH TRÌNH DU LỊCH\n`;
      content += `====================================================\n\n`;
      content += `Điểm đến dự kiến  : ${city.name}\n`;
      content += `Tình trạng thời tiết: ${city.condition} (${city.temperature}°C, Độ ẩm: ${city.humidity}%)\n`;
      content += `Ngày khởi hành    : ${state.departureDate ? state.departureDate : "Chưa xác định"}\n`;
      content += `Thời gian xuất file: ${exportDate}\n`;
      content += `Tổng số địa điểm  : ${totalItems}\n`;
      content += `----------------------------------------------------\n`;
      content += `DANH SÁCH CHI TIẾT CÁC ĐỊA ĐIỂM:\n\n`;

      state.itineraryList.forEach((item, index) => {
        const status = item.visited ? "[ĐÃ ĐẾN]" : "[CHƯA ĐẾN]";
        content += `${index + 1}. ${item.title}\n`;
        content += `   - Thời gian dự kiến: ${item.time}\n`;
        content += `   - Trạng thái        : ${status}\n\n`;
      });

      content += `----------------------------------------------------\n`;
      content += `Ghi chú: Lịch trình được xuất từ ứng dụng Weather & Travel Planner.\n`;
      content += `Chúc bạn có một chuyến đi an toàn và trọn vẹn!\n`;

      // Tạo Blob và liên kết tải về
      try {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement("a");
        const safeCityName = city.id;
        tempLink.href = downloadUrl;
        tempLink.download = `lich-trinh-${safeCityName}-${Date.now()}.txt`;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        // Thu hồi Object URL ngay sau khi tải hoàn tất
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 100);

        UIModule.showToast("Đã xuất file lịch trình (.txt) thành công!", "success");
      } catch (err) {
        console.error("Lỗi khi xuất file lịch trình:", err);
        UIModule.showToast("Không thể tạo file tải về, vui lòng thử lại!", "error");
      }
    }
  };

  /* ==========================================================================
     8. UI & TOAST NOTIFICATION MODULE
     ========================================================================== */
  const UIModule = {
    toastTimeoutId: null,

    showToast: function (message, type = "info") {
      if (!dom.toastNotification) return;

      if (this.toastTimeoutId) {
        clearTimeout(this.toastTimeoutId);
      }

      dom.toastNotification.textContent = message;
      dom.toastNotification.className = `toast-notification ${type} show`;

      this.toastTimeoutId = setTimeout(() => {
        dom.toastNotification.classList.remove("show");
      }, 3500);
    }
  };

  /* ==========================================================================
     APP INITIALIZATION
     ========================================================================== */
  function initializeApp() {
    cacheDomElements();
    WeatherModule.init();
    ItineraryModule.init();
    FilterSortPaginationModule.init();
    CountdownModule.init();
    ExportModule.init();

    // Áp dụng bộ lọc và render danh sách lần đầu
    FilterSortPaginationModule.applyAndRender();
  }

  // Khởi chạy khi DOM đã sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
