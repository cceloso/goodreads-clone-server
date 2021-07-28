const commonRepo = {
    searchIndex: (id, arr) => {
        for(let i = 0; i < arr.length; i++) {
            if(arr[i].id === id) {
                return i;
            }
        }
    },
};

module.exports = commonRepo;