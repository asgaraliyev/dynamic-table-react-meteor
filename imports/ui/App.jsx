import React from "react";
import { Hello } from "./Hello.jsx";
import { Info } from "./Info.jsx";
import Products, { ProductImages } from "../api/Products";
import DynamicTable from "./DynamicTable.jsx";
import {
  BrowserRouter,
  Route,
  Switch,
} from "react-router-dom/cjs/react-router-dom.min";
import Tags, { TagsCounter } from "../api/Tags.js";
export const App = () => (
  <div>
    <BrowserRouter>
      <Switch>
        <Route path="/tags" exact>
          <DynamicTable Collection={Tags} CountCollection={TagsCounter} />
        </Route>
        <Route path="/products" exact>
          <DynamicTable
            initialQuery={{}}
            initialPage={{
              perPage: 10,
              pageNum: 1,
            }}
            Top={({ onFieldChange, onRemoveField, getQuery }) => {
              const query = getQuery();
              return (
                <div>
                  <select
                    value={String(query?.hasSale)}
                    onChange={(e) => {
                      if (e.target.value) {
                        onFieldChange("hasSale", e.target.value === "true");
                      } else {
                        onRemoveField("hasSale");
                      }
                    }}
                  >
                    <option value="">Endrim</option>
                    <option value="true">Endrimli</option>
                    <option value="false">Endrimsiz</option>
                  </select>
                </div>
              );
            }}
            collection={"products"}
            Footer={({ pagination }) => {
              return (
                <tfoot>
                  <tr>
                    <td>Total:{pagination.count}</td>
                    <td>
                      <button onClick={pagination.onPrev}>Prev</button>
                    </td>
                    <td>
                      Current Page
                      <input
                        type="number"
                        onChange={(e) => {
                          pagination.onPaginationChange(
                            parseInt(e.target.value)
                          );
                        }}
                        defaultValue={pagination.pageNum}
                      ></input>
                    </td>
                    <td>
                      <button onClick={pagination.onNext}>Next</button>
                    </td>
                    <td>
                      per page:
                      <select
                        onChange={(e) => {
                          pagination.onPerPageChange(parseInt(e.target.value));
                        }}
                        defaultValue={pagination.perPage}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                      </select>
                    </td>
                  </tr>
                </tfoot>
              );
            }}
            Selectable={({ onChange, checked }) => {
              return (
                <td>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                  ></input>
                </td>
              );
            }}
            rows={[
              {
                fieldName: "title",
                title: "Title",
                Component: ({ title }) => {
                  return <td style={{ color: "green" }}>{title}</td>;
                },
              },
              {
                fieldName: "description",
                title: "Description",
                Component: ({ description, ...rest }) => {
                  return <td style={{ color: "red" }}>{description}</td>;
                },
              },
              {
                fieldName: "images.0",
                title: "Image",
                Component: (props) => {
                  return (
                    <td style={{ color: "red" }}>
                      <img
                        src={ProductImages.findOne({ _id: props["images.0"] })}
                      ></img>
                    </td>
                  );
                },
              },
              {
                fieldName: "_id",
                title: "Remove",
                Component: ({ _id, getSelectedItems }) => {
                  function onRemove() {
                    const selectedItems = getSelectedItems();
                    console.log("selectedItems", selectedItems);
                  }
                  return (
                    <td>
                      <button onClick={onRemove}>Remove</button>
                    </td>
                  );
                },
              },
              {
                fieldName: "Cost (€)",
              },
            ]}
          />
        </Route>
      </Switch>
    </BrowserRouter>
  </div>
);
