package com.be.scamshield.service;

import com.be.scamshield.entity.User;

public interface IUserAlertSubscriptionService {
    void subscribeAllCategories(User user);
    // Có thể thêm các hàm subscribe theo từng category riêng lẻ sau này
}
