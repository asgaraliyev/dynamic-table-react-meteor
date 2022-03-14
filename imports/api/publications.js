import { pageToQuery } from "../both/functions";
import { Products, Tags, ProductImages, Categories } from "./Collections/index";
import Collections from "./Collections/index";
import { publishComposite } from "meteor/reywood:publish-composite";
import { Random } from "meteor/random";

publishComposite("tags", function (query, pageParam) {
  return {
    find() {
      return Tags.find(query, pageToQuery(pageParam));
    },
  };
});
publishComposite("categories", function (query, pageParam) {
  console.log(Categories.find(query, pageToQuery(pageParam)).fetch());
  return {
    find() {
      return Categories.find(query, pageToQuery(pageParam));
    },
  };
});
publishComposite(
  "products",
  function (
    query = {},
    pageParam = {
      pageNum: 1,
      perPage: 10,
    }
  ) {
    return {
      find() {
        return Products.find(query, pageToQuery(pageParam));
      },
      children: [
        {
          find(product) {
            const _ids = [];
            for (let index = 0; index < product.images.length; index++) {
              _ids.push(product.images[index]);
            }
            return ProductImages.find({ "meta.productId": { $in: _ids } })
              .cursor;
          },
        },
      ],
    };
  }
);
Meteor.publish(
  "any.counter",
  function (colName, query = {}, docId = Random.id()) {
    const virtualColName = "any_counter_collection";
    const Collection = Collections[colName];
    let count = 0;
    let initializing = true;
    let itemIds = [];
    const handleCount = Collection.find(query, {
      fields: { _id: 1 },
    }).observeChanges({
      added: (id, doc) => {
        count += 1;
        itemIds.push(id);
        if (!initializing) {
          this.changed(virtualColName, docId, {
            count,
            itemIds,
          });
        }
      },
      removed: (id, doc) => {
        itemIds.splice(itemIds.findIndex(id), 1);
        count -= 1;
        this.changed(virtualColName, docId, {
          count,
          itemIds,
        });
      },
    });
    initializing = false;
    this.added(
      virtualColName,
      docId,
      {
        count,
        itemIds,
      },
      (err, res) => {
        if (err) {
          console.log("error" + err);
        } else {
          console.log("res=" + res);
        }
      }
    );
    this.ready();
    this.onStop(() => handleCount.stop());
  }
);
