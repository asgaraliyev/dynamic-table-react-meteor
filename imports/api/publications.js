import { pageToQuery } from "../both/functions";
import Products, { ProductImages } from "./Products";
import { publishComposite } from "meteor/reywood:publish-composite";
import { Random } from "meteor/random";
import Tags from "./Tags";

publishComposite("tags", function (query, pageParam) {
  return {
    find() {
      return Tags.find(query, pageToQuery(pageParam));
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
Meteor.publish("any.counter", function (colName, query = {}, queryChanged) {
  const Collection = Mongo.Collection.get(colName);
  const virtualColName = Collection._name + "_count";
  let count = 0;
  let initializing = true;
  const docId = Random.id();
  const handleCount = Collection.find(query, {
    fields: { _id: 1 },
  }).observeChanges({
    added: () => {
      count += 1;
      if (!initializing) {
        this.changed(virtualColName, docId, {
          count,
        });
      }
    },
    removed: () => {
      count -= 1;

      this.changed(virtualColName, docId, {
        count,
      });
    },
  });
  initializing = false;
  this.added(
    virtualColName,
    docId,
    {
      count,
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
});
