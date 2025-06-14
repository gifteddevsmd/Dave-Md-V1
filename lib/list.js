//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                     𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭 𝐁𝐎𝐓                                                  //
//                                                                                                      //
//                                       𝐂𝐔𝐒𝐓𝐎𝐌 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄 𝐌𝐎𝐃𝐔𝐋𝐄                                         //
//                                                                                                      //
//   This module manages custom responses for groups (text/image replies based on specific triggers).   //
//                                                                                                      //
//   © 2025 Dave-Md-V1                                                                                  //
//   Developed by Gifted Dave | WhatsApp: https://wa.me/254104260236                                   //
//   GitHub: https://github.com/gifteddaves | Telegram: https://t.me/Digladoo                           //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//

const fs = require('fs');

// Add a new custom response
function addResponList(groupID, key, response, isImage, image_url, _db) {
    const obj_add = {
        id: groupID,
        key,
        response,
        isImage,
        image_url
    };
    _db.push(obj_add);
    fs.writeFileSync('./src/store/list.json', JSON.stringify(_db, null, 3));
}

// Get custom response data
function getDataResponList(groupID, key, _db) {
    let position = null;
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            position = x;
        }
    });
    if (position !== null) {
        return _db[position];
    }
}

// Check if a key is already set in the group
function isAlreadyResponList(groupID, key, _db) {
    return _db.some(entry => entry.id === groupID && entry.key === key);
}

// Return a response if a key matches
function sendResponList(groupId, key, _dir) {
    let position = null;
    Object.keys(_dir).forEach((x) => {
        if (_dir[x].id === groupId && _dir[x].key === key) {
            position = x;
        }
    });
    if (position !== null) {
        return _dir[position].response;
    }
}

// Check if group has any response list at all
function isAlreadyResponListGroup(groupID, _db) {
    return _db.some(entry => entry.id === groupID);
}

// Delete a specific response
function delResponList(groupID, key, _db) {
    let position = null;
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            position = x;
        }
    });

    if (position !== null) {
        _db.splice(position, 1);
        fs.writeFileSync('./src/store/list.json', JSON.stringify(_db, null, 3));
    }
}

// Update an existing response
function updateResponList(groupID, key, response, isImage, image_url, _db) {
    let position = null;
    Object.keys(_db).forEach((x) => {
        if (_db[x].id === groupID && _db[x].key === key) {
            position = x;
        }
    });
    if (position !== null) {
        _db[position].response = response;
        _db[position].isImage = isImage;
        _db[position].image_url = image_url;
        fs.writeFileSync('./src/store/list.json', JSON.stringify(_db, null, 3));
    }
}

// Export all response-list functions
module.exports = {
    addResponList,
    delResponList,
    isAlreadyResponList,
    isAlreadyResponListGroup,
    sendResponList,
    updateResponList,
    getDataResponList
};