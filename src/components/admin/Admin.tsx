import { Formik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import { useAuctionsData } from "src/storages/auctionsData";
import { useLotsData } from "src/storages/lotsData";
import { useProjectsData } from "src/storages/projectsData";
import { getUsers } from "src/utils/api";
import { authFetch } from "src/utils/authFetch";
import { useUserData } from "../../storages/userData";
import "../../styles/admin.scss";
import bem from "../../utils/bem";
import InputMask from "react-input-mask";
import ROUTES from "../../utils/routes";
import BetHistory from "./BetHistory";

const cn = bem("admin");

export default function Admin() {
  const [mode, setMode] = useState("auction");
  const [users, setUsers] = useState([]);

  async function fillUsers() {
    const res: any = await authFetch({ url: getUsers, method: "GET" });
    setUsers(res);
  }

  useEffect(() => {
    fillUsers();
  }, []);

  return (
    <>
      <ul className={cn("nav")}>
        <li
          className={cn("nav-item", { active: mode === "auction" })}
          onClick={() => setMode("auction")}
        >
          Аукционы и лоты
        </li>
        <li
          className={cn("nav-item", { active: mode === "project" })}
          onClick={() => setMode("project")}
        >
          Проекты
        </li>
        <li
          className={cn("nav-item", { active: mode === "users" })}
          onClick={() => setMode("users")}
        >
          Пользователи
        </li>
      </ul>
      {mode === "auction" ? (
        <AuctionCreation users={users} />
      ) : mode === "project" ? (
        <ProjectCreation />
      ) : mode === "users" ? (
        <UserModeration users={users} fillUsers={fillUsers} />
      ) : null}
    </>
  );
}

function AuctionCreation({ users }) {
  const [user] = useUserData();
  const [auctions, auctionsInterface] = useAuctionsData();
  const [lots, lotsInterface] = useLotsData();
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const currentLots = useMemo(
    () =>
      selectedAuction
        ? lots?.filter(({ auction_id }) => auction_id === selectedAuction) || []
        : [],
    [selectedAuction, lots]
  );
  const [selectedLot, setSelectedLot] = useState<any>(null);

  function handleLotDelete(body) {
    setSelectedLot(null);
    lotsInterface.delete(body);
  }

  function handleDeleteAuction(body) {
    setSelectedLot(null);
    setSelectedAuction(null);
    auctionsInterface.delete(body);
  }

  if (!user?.is_admin) {
    return <Redirect to={ROUTES.ROUTE_HOME} />;
  }

  return (
    <table className={cn("")}>
      <thead>
        <tr>
          <td className={cn("cell")}>Аукционы</td>
          <td className={cn("cell")}>Лоты</td>
          <td className={cn("cell")}>Инфо</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={cn("cell")}>
            {auctions?.map(({ name, id }) => (
              <div
                onClick={() => {
                  setSelectedAuction(id);
                  setSelectedLot(null);
                }}
                className={cn("item", { active: id === selectedAuction })}
              >
                {name}
              </div>
            ))}
            <div
              className={cn("item", { active: selectedAuction === "new" })}
              onClick={() => {
                setSelectedAuction("new");
                setSelectedLot(null);
              }}
            >
              Новый аукцион
            </div>
          </td>
          <td className={cn("cell")}>
            {currentLots?.map(({ name, id }) => (
              <div
                onClick={() => setSelectedLot(id)}
                className={cn("item", { active: id === selectedLot })}
              >
                {name}
              </div>
            ))}
            {selectedAuction && selectedAuction !== "new" && (
              <div
                className={cn("item", { active: selectedLot === "new" })}
                onClick={() => {
                  setSelectedLot("new");
                }}
              >
                Новый лот
              </div>
            )}
          </td>
          <td className={cn("cell")}>
            {selectedLot === "new" ? (
              <CreateLot
                onSubmit={lotsInterface.create}
                auction_id={selectedAuction}
              />
            ) : selectedLot ? (
              <LotInfo
                users={users}
                data={lots.find((l) => l.id === selectedLot)}
                onDelete={handleLotDelete}
              />
            ) : selectedAuction === "new" ? (
              <CreateAuction onSubmit={auctionsInterface.create} />
            ) : selectedAuction ? (
              <AuctionInfo
                onDelete={handleDeleteAuction}
                data={auctions.find((a) => a.id === selectedAuction)}
              />
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const LOT_STRUCT = {
  name: { label: "Имя" },
  author: { label: "Автор" },
  year: { label: "Год" },
  type: { label: "Тип" },
  size: { label: "Размер" },
  price: { label: "Текущая цена" },
  fiction_start_price: { label: "цена от" },
  fiction_end_price: { label: "цена до" },
  image_link: { label: "Картинка", image: true },
  is_sold: { label: "Выкуплена", boolean: true },
};

function LotInfo({ data, onDelete, users }) {
  function handleDelete() {
    const form = new FormData();
    form.append("id", data.id);
    onDelete(form);
  }

  return (
    <div className={cn("info")}>
      {Object.entries(LOT_STRUCT).map(
        ([key, { label, image, boolean }]: any) => (
          <>
            <div>{label}</div>
            {image ? (
              <div className={cn("images")}>
                {data[key].map((src) => (
                  <img alt="" className={cn("image")} src={src} />
                ))}
              </div>
            ) : boolean ? (
              <div>{data[key] ? "Да" : "Нет"}</div>
            ) : (
              <div>{data[key]}</div>
            )}
          </>
        )
      )}
      <Button onClick={handleDelete}>Удалить</Button>
      <div />
      <div>История ставок</div>
      <BetHistory lotId={data.id} users={users} />
    </div>
  );
}

function CreateLot({ onSubmit, auction_id }) {
  function handleSubmit(data) {
    const values = { ...data };
    const images = [...values.image_link];
    delete values.image_link;
    const valuesForForm = Object.entries(values);
    const formData = new FormData();
    images.forEach((image, index) =>
      formData.append(`image${index + 1}`, image)
    );
    valuesForForm.forEach(([key, value]) => formData.append(key, `${value}`));
    formData.append("images_count", `${images.length}`);
    formData.append("auction_id", `${auction_id}`);
    onSubmit(formData);
  }

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{
        name: "",
        author: "",
        year: "",
        type: "",
        size: "",
        price: 0,
        fiction_start_price: 0,
        fiction_end_price: 0,
        image_link: [],
      }}
    >
      {({ values, setFieldValue, handleSubmit }: any) => (
        <div className={cn("info")}>
          {Object.entries(values).map(([key, value]: any) => (
            <>
              <div>{LOT_STRUCT[key]?.label}</div>
              {LOT_STRUCT[key]?.image ? (
                <div>
                  <div>{values[key].map(({ name }) => name).join(", ")}</div>
                  <input
                    onChange={(e) => {
                      setFieldValue(key, [...values[key], e.target.files?.[0]]);
                    }}
                    type="file"
                  />
                </div>
              ) : (
                <input
                  value={value}
                  onChange={(e) => setFieldValue(key, e.target.value)}
                  type="text"
                />
              )}
            </>
          ))}
          <Button onClick={handleSubmit}>Создать</Button>
        </div>
      )}
    </Formik>
  );
}

const AUCTION_STRUCT = {
  name: { label: "Имя" },
  description: { label: "Описание" },
  image_link: { label: "Картинка", image: true },
  start_timestamp: { label: "Дата начала", date: true },
  finish_timestamp: { label: "Дата конца", date: true },
  text_line_running: { label: "Текст бегущей строки" },
  price_steps: { label: "Шаг цены", steps: true },
};

function AuctionInfo({ data, onDelete }) {
  function handleDelete() {
    const form = new FormData();
    form.append("id", data.id);
    onDelete(form);
  }

  return (
    <div className={cn("info")}>
      {Object.entries(AUCTION_STRUCT).map(
        ([key, { label, image, boolean, date }]: any) => (
          <>
            <div>{label}</div>
            {image ? (
              <div className={cn("images")}>
                <img className={cn("image")} src={data[key]} />
              </div>
            ) : boolean ? (
              <div>{data[key] ? "Да" : "Нет"}</div>
            ) : date ? (
              <div>{`${new Date(data[key])}`}</div>
            ) : (
              <div>{data[key]}</div>
            )}
          </>
        )
      )}
      <Button onClick={handleDelete}>Удалить</Button>
    </div>
  );
}

function formatDate(date) {
  return `${date}:00.000 +0300`;
}

function CreateAuction({ onSubmit }) {
  function handleSubmit(data) {
    const values = { ...data };
    const image = values.image_link;
    values.start_timestamp = formatDate(values.start_timestamp);
    values.finish_timestamp = formatDate(values.finish_timestamp);
    delete values.image_link;
    const valuesForForm = Object.entries(values);
    const formData = new FormData();
    formData.append("image", image);
    valuesForForm.forEach(([key, value]) => formData.append(key, `${value}`));
    onSubmit(formData);
  }

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{
        name: "",
        description: "",
        image_link: "",
        start_timestamp: "",
        finish_timestamp: "",
        text_line_running: "",
        price_steps: '{"0": 0}',
      }}
    >
      {({ values, setFieldValue, handleSubmit }: any) => (
        <div className={cn("info")}>
          {Object.entries(values).map(([key, value]: any) => (
            <>
              <div>{AUCTION_STRUCT[key]?.label}</div>
              {AUCTION_STRUCT[key]?.image ? (
                <input
                  onChange={(e) => {
                    setFieldValue(key, e.target.files?.[0]);
                  }}
                  type="file"
                />
              ) : AUCTION_STRUCT[key]?.steps ? (
                <PriceSteps
                  value={values.price_steps}
                  onChange={(data) => setFieldValue("price_steps", data)}
                />
              ) : AUCTION_STRUCT[key]?.date ? (
                <InputMask
                  mask={"9999-99-99 99:99"}
                  value={value}
                  onChange={(e) => setFieldValue(key, e.target.value)}
                >
                  {(inputProps) => <input {...inputProps} type="text" />}
                </InputMask>
              ) : (
                <input
                  value={value}
                  onChange={(e) => setFieldValue(key, e.target.value)}
                  type="text"
                />
              )}
            </>
          ))}
          <Button onClick={handleSubmit}>Создать</Button>
        </div>
      )}
    </Formik>
  );
}

function PriceSteps({ value, onChange }: any) {
  const [redact, setRedact] = useState(false);
  const [pending, setPending] = useState(JSON.parse(value));

  function handleApply() {
    onChange(JSON.stringify(pending));
    setRedact(false);
  }

  function handleChange(i, v) {
    setPending((state) => {
      const clone = { ...state };
      clone[i] = v;
      return clone;
    });
  }

  return (
    <div className={cn("info")}>
      {redact ? (
        <>
          {Object.entries(pending).map(([index, value]: any) => (
            <>
              <div>{+index + 1}</div>
              <input
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            </>
          ))}
          <Button
            onClick={() => {
              setPending((state) => {
                const clone = { ...state };
                clone[Object.keys(clone).length] = 0;
                return clone;
              });
            }}
          >
            Еще шаг
          </Button>
          <Button onClick={() => handleApply()}>Сохранить шаг цен</Button>
        </>
      ) : (
        <div>
          {value}
          <Button onClick={() => setRedact(true)}>Редактировать</Button>
        </div>
      )}
    </div>
  );
}

const PROJECT_STRUCT = {
  name: { label: "Имя" },
  description: { label: "Описание" },
  is_now: { label: "Текущий", boolean: true },
  main_picture: { label: "Главная картинка", image: true },
  other_pictures: { label: "Остальные картинки", images: true },
};

function ProjectCreation() {
  const [projects, projectsInterface] = useProjectsData();
  const [selected, setSelected] = useState<any>(null);
  const selectedProject = useMemo(
    () => selected !== "new" && projects?.find((p) => p.id === selected),
    [selected]
  );

  async function handleDelete() {
    const form = new FormData();
    form.append("id", selectedProject.id);
    setSelected(null);
    projectsInterface.delete(form);
  }

  return (
    <table className={cn(null, "projects")}>
      <thead>
        <tr>
          <td className={cn("cell")}>Проекты</td>
          <td className={cn("cell")}>Инфо</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={cn("cell")}>
            {projects?.map(({ name, id }) => (
              <div
                key={id}
                onClick={() => {
                  setSelected(id);
                }}
                className={cn("item", { active: id === selected })}
              >
                {name}
              </div>
            ))}
            <div
              className={cn("item", { active: selected === "new" })}
              onClick={() => {
                setSelected("new");
              }}
            >
              Новый проект
            </div>
          </td>
          <td className={cn("cell")}>
            {selected === "new" ? (
              <CreateProject />
            ) : (
              selectedProject && (
                <div className={cn("info")}>
                  {Object.entries(PROJECT_STRUCT).map(
                    ([key, { label, image, images, boolean }]: any) => (
                      <>
                        <div>{label}</div>
                        {image ? (
                          <img
                            alt=""
                            className={cn("image")}
                            src={selectedProject[key]}
                          />
                        ) : images ? (
                          <div className={cn("images")}>
                            {selectedProject[key].map((src) => (
                              <img alt="" className={cn("image")} src={src} />
                            ))}
                          </div>
                        ) : boolean ? (
                          <div>{selectedProject[key] ? "Да" : "Нет"}</div>
                        ) : (
                          <div>{selectedProject[key]}</div>
                        )}
                      </>
                    )
                  )}
                  <Button onClick={handleDelete}>Удалить</Button>
                </div>
              )
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function CreateProject() {
  const [, projectsInterface] = useProjectsData();

  async function handleSubmit(data) {
    const values = { ...data };
    const images = [...values.other_pictures];
    const main_picture = values.main_picture;
    delete values.other_pictures;
    delete values.main_picture;
    const valuesForForm = Object.entries(values);
    const formData = new FormData();
    images.forEach((image, index) =>
      formData.append(`image${index + 1}`, image)
    );
    valuesForForm.forEach(([key, value]) => formData.append(key, `${value}`));
    formData.append("images_count", `${images.length}`);
    formData.append("main_picture", main_picture);
    await projectsInterface.create(formData);
  }

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{
        name: "",
        description: "",
        main_picture: null,
        other_pictures: [],
      }}
    >
      {({ values, setFieldValue, handleSubmit }: any) => (
        <div className={cn("info")}>
          {Object.entries(values).map(([key, value]: any) => (
            <>
              <div>{PROJECT_STRUCT[key]?.label}</div>
              {PROJECT_STRUCT[key]?.images ? (
                <div>
                  <div>{values[key].map(({ name }) => name).join(", ")}</div>
                  <input
                    onChange={(e) => {
                      setFieldValue(key, [...values[key], e.target.files?.[0]]);
                    }}
                    type="file"
                  />
                </div>
              ) : PROJECT_STRUCT[key]?.image ? (
                <input
                  onChange={(e) => {
                    setFieldValue(key, e.target.files?.[0]);
                  }}
                  type="file"
                />
              ) : (
                <input
                  value={value}
                  onChange={(e) => setFieldValue(key, e.target.value)}
                  type="text"
                />
              )}
            </>
          ))}
          <Button onClick={handleSubmit}>Создать</Button>
        </div>
      )}
    </Formik>
  );
}

const USER_STRUCT = {
  email: { label: "email" },
  first_name: { label: "Имя" },
  second_name: { label: "Фамилия" },
  is_admin: { label: "Админ", boolean: true },
  is_ban: { label: "В бане", boolean: true, ban: true },
  is_mail_verify: { label: "Почта подтверждена", boolean: true },
  phone: { label: "Телефон" },
};

function UserModeration({ users, fillUsers }) {
  const [, userInterface] = useUserData();
  const [selected, setSelected] = useState(null);
  const selectedUser: any = useMemo(
    () => selected !== null && users.find((u: any) => u.id === selected),
    [selected, users]
  );

  async function handleBan(id) {
    const form = new FormData();
    form.append("user_id", id);
    await userInterface.ban(form);
    await fillUsers();
  }

  async function handleUnban(id) {
    const form = new FormData();
    form.append("user_id", id);
    await userInterface.unban(form);
    await fillUsers();
  }

  return (
    <table className={cn(null, "projects")}>
      <thead>
        <tr>
          <td className={cn("cell")}>Проекты</td>
          <td className={cn("cell")}>Инфо</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={cn("cell")}>
            {users.map(({ email, id }) => (
              <div
                onClick={() => {
                  setSelected(id);
                }}
                className={cn("item", { active: id === selected })}
              >
                {email}
              </div>
            ))}
          </td>
          <td className={cn("cell")}>
            {!!selectedUser && (
              <div className={cn("info")}>
                {Object.entries(USER_STRUCT).map(
                  ([key, { label, boolean, ban }]: any) => (
                    <>
                      <div>{label}</div>
                      {boolean ? (
                        <div>
                          {selectedUser[key] ? "Да" : "Нет"}
                          {ban && (
                            <Button
                              onClick={() =>
                                selectedUser[key]
                                  ? handleUnban(selectedUser.id)
                                  : handleBan(selectedUser.id)
                              }
                            >
                              {selectedUser[key] ? "Разбанить" : "Забанить"}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div>{selectedUser[key]}</div>
                      )}
                    </>
                  )
                )}
              </div>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
