/** © Creator SN */
class ThemeColor {
    static readRGB(url, func = null) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let img = new Image();
        img.src = url;
        img.onload = () => {
            ctx.clearRect(0, 0, 200, 200 * img.height / img.width);
            ctx.drawImage(img, 0, 0, 200, 200 * img.height / img.width);
            let data = ctx.getImageData(0, 0, 200, 200 * img.height / img.width).data;
            // console.log(data);
            if (func != null)
                func(data);
        };
    }
    static rgb2(rgba) {   //rgb|rgba->[[][][]]
        let r = rgba[0].toString(2);
        let g = rgba[1].toString(2);
        let b = rgba[2].toString(2);
        while (r.toString().length < 8) {
            r = '0' + r;
        }
        while (g.toString().length < 8) {
            g = '0' + g;
        }
        while (b.toString().length < 8) {
            b = '0' + b;
        }
        return [r, g, b];
    }
    static treeInit(isLeaf = false) {   //Octree Init
        let tree = [];
        for (let i = 0; i < 8; i++) {
            tree.push({
                count: 0,
                r: 0,
                g: 0,
                b: 0,
                isLeaf: isLeaf,
                father: null,
                children: null
            });
        }
        return tree;
    }
    static updateTree(url, tree, callback = null) {
        let t = tree;
        let reduce = [];    //Combine Array BFS
        this.readRGB(url, (data) => {
            for (let i = 0; i < (data.length / 4 - 1); i++) {
                t = tree;
                let matrix = this.rgb2([data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]);
                for (let j = 0; j < 8; j++) {
                    let num = matrix[0][j].toString() + matrix[1][j].toString() + matrix[2][j].toString();  //r[i]g[i]b[i]
                    t[parseInt(num, 2)].count++;
                    t[parseInt(num, 2)].r += data[i * 4];
                    t[parseInt(num, 2)].g += data[i * 4 + 1];
                    t[parseInt(num, 2)].b += data[i * 4 + 2];
                    if (t[parseInt(num, 2)].children == null && j < 7) {
                        t[parseInt(num, 2)].children = j != 6 ? this.treeInit() : this.treeInit(true); //leafNode set isLeaf = true
                        t[parseInt(num, 2)].children.father = t[parseInt(num, 2)];
                        reduce.push(t[parseInt(num, 2)].children);
                    }
                    t = t[parseInt(num, 2)].children;
                }
            }

            for (let i = reduce.length - 1; i >= 0; i--) {    //reduce tree
                let count = 0;
                let r = 0;
                let g = 0;
                let b = 0;
                for (let j = 0; j < 8; j++) {
                    count += reduce[i][j].count;
                    r += reduce[i][j].r;
                    g += reduce[i][j].g;
                    b += reduce[i][j].b;
                }
                reduce[i].father.count += count;
                reduce[i].father.r += r;
                reduce[i].father.g += g;
                reduce[i].father.b += b;
                reduce[i].father.children = null;
            }

            for (let i = 0; i < 8; i++) { //export result
                if (tree[i].count > 0)
                    tree[i].result = [Math.round(tree[i].r / tree[i].count), Math.round(tree[i].g / tree[i].count), Math.round(tree[i].b / tree[i].count)];
            }
            // console.log(tree);
            if (callback != null)
                callback(tree);
        });
    }
    static ThemeColorPicker(url, callback = null) {
        this.updateTree(url, this.treeInit(), (tree) => {
            let result = [];
            for (let item of tree) {
                if (item.result != null)
                    result.push({
                        hot: item.count,
                        color: item.result,
                        rgba: `${item.result[0]},${item.result[1]},${item.result[2]},1`
                    });
            }
            if (callback != null)
                callback(result);
        });
    }
}

export default ThemeColor;