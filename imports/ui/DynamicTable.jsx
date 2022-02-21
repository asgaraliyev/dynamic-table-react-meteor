import React from "react";
import "./dynamic-table.css";
import { Random } from "meteor/random";
import { useTracker } from "meteor/react-meteor-data";
import {
  decryptObj,
  encrypt,
  encryptObj,
  pageToQuery,
  toDotize,
} from "../both/functions";
import { useHistory, useLocation } from "react-router-dom";
import { queryEncryptionSalt } from "../both/contstants";
import AllCollections from "../api/Collections/index";
let paginationChangeTyping;
export default function DynamicTable({
  rows = [],
  collection,
  Selectable = false,
  Footer = false,
  subscription,
  initialQuery = {},
  Top = false,
  initialPage = {
    perPage: 10,
    pageNum: 1,
  },
}) {
  const history = useHistory();
  const location = useLocation();
  if (!subscription) throw new Error("Dynamic table needs subscription name");
  if (!collection) throw new Error("Dynamic table needs collection name");
  const [query, setQuery] = React.useState(initialQuery);
  const [page, setPage] = React.useState({
    pageNum: 1,
    perPage:
      parseInt(localStorage.getItem(`dynamic_table_${collection}_per_page`)) ||
      initialPage?.perPage,
  });
  const [dynamicTableId, setdynamicTableId] = React.useState(Random.id());
  const [selectedItems, setSelectedItems] = React.useState([]);
  const props = useTracker(() => {
    const result = {};
    !Meteor.subscribe(collection.toLocaleLowerCase(), query, page).ready();
    !Meteor.subscribe("any.counter", collection, query, dynamicTableId).ready();
    result.loading = false;
    result.pagination = {
      count: AllCollections[collection].findOne({ _id: dynamicTableId })?.count,
      ...page,
    };
    result.items = AllCollections[collection]
      .find(query, pageToQuery(page))
      .fetch();
      console.log( result.items)
    for (let itemIndex = 0; itemIndex < result.items.length; itemIndex++) {
      result.items[itemIndex] = toDotize(result.items[itemIndex]);
      result.items[itemIndex]["COMPONENTS"] = [];
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        if (result.items[itemIndex][rows[rowIndex]?.fieldName]) {
          result.items[itemIndex]["COMPONENTS"].push(rows[rowIndex]?.Component);
          result.items[itemIndex]["TABLE_DATA"] = {
            checked: !!selectedItems.find(
              (item) => item._id === result.items[itemIndex]._id
            ),
          };
        }
      }
    }
    return result;
  }, [query, page, selectedItems.length]);

  function selectableOnChange(e, item) {
    if (e.target.checked === true && item === "ALL") {
      setSelectedItems(props.items);
    } else if (e.target.checked === false && item === "ALL") {
      setSelectedItems([]);
    } else {
      if (e.target.checked === true && item) {
        let found = false;
        for (let index = 0; index < selectedItems.length; index++) {
          if (selectedItems[index]._id === item._id) {
            found = true;
          }
        }

        if (found === false) {
          setSelectedItems([...selectedItems, item]);
        }
      } else if (e.target.checked === false && item) {
        const newCopiedSelectedItems = [...selectedItems];
        for (let index = 0; index < selectedItems.length; index++) {
          if (selectedItems[index]._id === item._id) {
            newCopiedSelectedItems.splice(index, 1);
          }
        }
        setSelectedItems(newCopiedSelectedItems);
      }
    }
  }

  React.useEffect(() => {
    const params = {
      query,
      page,
    };
    let encrypted = encryptObj(params, queryEncryptionSalt);
    history.push(`${history.location.pathname}?${dynamicTableId}=${encrypted}`);
  }, [query, page]);

  React.useEffect(() => {
    let params = new URLSearchParams(location.search);
    params = params.get(dynamicTableId);
    if (params) {
      const { query, page } = decryptObj(params, queryEncryptionSalt);
      setPage(page);
      setQuery(query);
    }
  }, []);
  const paginationMethods = {
    onPaginationChange(pageNum) {
      clearTimeout(paginationChangeTyping);
      paginationChangeTyping = setTimeout(() => {
        if (!isNaN(pageNum)) {
          setPage({ ...page, pageNum });
        }
      }, 1000);
    },
    onPerPageChange(perPage) {
      localStorage.setItem(`dynamic_table_${collection}_per_page`, perPage);
      setPage({ ...page, perPage });
    },
    onNext() {
      const { pageNum } = page;
      if (pageNum)
        setPage({
          ...page,
          pageNum: pageNum + 1,
        });
    },
    onPrev() {
      const { pageNum } = page;
      if (pageNum === 1) return;
      setPage({
        ...page,
        pageNum: pageNum - 1,
      });
    },
  };
  const generalMethods = {
    getSelectedItems() {
      return selectedItems;
    },
    getQuery() {
      return { ...query };
    },
  };
  const formMethods = {
    onFieldChange(name, value) {
      setPage({ ...page, pageNum: 1 });
      setQuery({ ...query, [name]: value });
    },
    onRemoveField(name) {
      const copy = { ...query };
      delete copy[name];
      setPage({ ...page, pageNum: 1 });
      setQuery(copy);
    },
  };
  return (
    <>
      {Top ? <Top {...formMethods} {...generalMethods} /> : null}
      <table className="super-dynamic-table">
        <thead>
          <tr>
            {Selectable ? (
              <Selectable
                checked={props.items.length === selectedItems.length}
                onChange={(event) => {
                  selectableOnChange(event, "ALL");
                }}
              />
            ) : null}
            {rows.map((row, i) => {
              return <th key={i}>{row.title}</th>;
            })}
          </tr>
        </thead>

        <tbody>
          {props.items.map((item, i) => {
            return (
              <tr key={i}>
                {Selectable ? (
                  <Selectable
                    checked={item["TABLE_DATA"]?.checked}
                    onChange={(event) => {
                      selectableOnChange(event, item);
                    }}
                  />
                ) : null}
                {item["COMPONENTS"]?.map((Component, i) => {
                  return <Component key={i} {...item} {...generalMethods} />;
                })}
              </tr>
            );
          })}
        </tbody>
        {Footer ? (
          <Footer
            pagination={{
              ...paginationMethods,
              ...props.pagination,
            }}
          />
        ) : null}
      </table>
    </>
  );
}
