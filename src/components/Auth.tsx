import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { useUserData } from "../storages/userData";
import "../styles/auth.scss";
import bem from "../utils/bem";

const cn = bem("auth");

export const AuthContext = React.createContext<any>(null);

export default function AuthProvider({ children }) {
  const [show, setShow] = useState(false);

  function openAuth() {
    setShow(true);
  }

  return (
    <AuthContext.Provider value={{ openAuth }}>
      <Auth
        show={show}
        onClose={() => {
          setShow(false);
        }}
      />
      {children}
    </AuthContext.Provider>
  );
}

function Auth({ show, onClose }) {
  const [user] = useUserData();
  const [mode, setMode] = useState(
    user?.email && !(user?.is_mail_verify || user?.is_ban) ? "signup" : "signin"
  );

  function handleClose() {
    setMode(
      user?.email && !(user?.is_mail_verify || user?.is_ban)
        ? "signup"
        : "signin"
    );
    onClose();
  }

  return (
    <Modal
      centered={true}
      show={show}
      onHide={handleClose}
      dialogClassName={cn()}
    >
      <i onClick={handleClose} className={cn("close", bem.pass("bi bi-x"))} />
      <Modal.Body>
        {mode === "signin" && (
          <SignIn
            onSignUpNavigate={async () => {
              setMode("signup");
            }}
            onClose={handleClose}
          />
        )}
        {mode === "signup" && (
          <SignUp
            onSignInNavigate={() => setMode("signin")}
            onClose={handleClose}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}

const SIGN_IN_FIELDS = {
  email: { type: "text", autoComplete: "email", label: "Email" },
  password: { type: "password", autoComplete: "new-password", label: "Пароль" },
};

function SignIn({ onSignUpNavigate, onClose }) {
  const [user, userInterface] = useUserData();
  const [loginError, setLoginError] = useState("");

  async function handleSubmit(values) {
    try {
      await userInterface.login(values);
    } catch (e) {
      setLoginError("Неверная комбинация логина/пароля");
    }
  }

  function handleValidate(values) {
    const errors: any = {};

    if (values.password.length < 8) {
      errors.password = "Неверный пароль";
    }

    return errors;
  }

  useEffect(() => {
    if (user?.email && !user?.is_mail_verify) {
      onSignUpNavigate();
    } else if (user?.is_mail_verify) {
      onClose();
    }
  }, [user]);

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      onSubmit={handleSubmit}
      validate={handleValidate}
      validateOnChange={false}
    >
      {({ values, handleSubmit, errors, setFieldValue }) => (
        <>
          <h1 className="text-center">Вход</h1>
          {!!loginError && <div className={cn("error")}>{loginError}</div>}
          <Form>
            {Object.entries(SIGN_IN_FIELDS).map(
              ([name, { type, autoComplete, label }]) => (
                <InputGroup key={name} hasValidation>
                  <Form.Group className="mb-3 w-100">
                    <Form.Label>{label}*</Form.Label>
                    <Form.Control
                      value={values[name]}
                      onChange={(e) => setFieldValue(name, e.target.value)}
                      type={type}
                      name={name}
                      autoComplete={autoComplete}
                      isInvalid={!!errors[name]}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmit();
                        }
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[name]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </InputGroup>
              )
            )}
            <div className="d-flex justify-content-center mt-4">
              <Button
                size={"lg"}
                variant={"dark"}
                onClick={() => handleSubmit()}
              >
                Войти
              </Button>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <span
                className="text-dark cursor-pointer"
                onClick={onSignUpNavigate}
              >
                Регистрация
              </span>
            </div>
          </Form>
        </>
      )}
    </Formik>
  );
}

const SIGN_UP_FIELDS = {
  first_name: { type: "text", autoComplete: "given-name", label: "Имя" },
  second_name: { type: "text", autoComplete: "family-name", label: "Фамилия" },
  email: { type: "text", autoComplete: "email", label: "Email" },
  phone: { type: "text", autoComplete: "tel", label: "Телефон" },
  password: { type: "password", autoComplete: "new-password", label: "Пароль" },
  password2: {
    type: "password",
    autoComplete: "new-password",
    label: "Повтор пароля",
  },
};

function SignUp({ onSignInNavigate, onClose }) {
  const [user, userInterface] = useUserData();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  async function handleSubmit(values) {
    const body = { ...values };
    delete body.password2;
    try {
      await userInterface.register(values);
    } catch (e: any) {
      setStep(0);
      setError(e?.data?.text || "Что-то пошло не так");
    }
  }

  function handleValidate(values) {
    const errors: any = {};

    Object.entries(values).forEach(([key, value]) => {
      if (!value) {
        errors[key] = "Обязательное поле";
      }
    });

    if (values.password.length < 8) {
      errors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (values.password !== values.password2) {
      errors.password2 = "Пароли не совпадают";
    }

    return errors;
  }

  if (user?.email && user?.is_ban) {
    return <div>Вы внесены в бан-лист</div>;
  }

  if (user?.email && !user?.is_mail_verify) {
    return (
      <>
        <div>
          Мы выслали подтверждение на почту {user.email}. Пожалуйста, перейдите
          по ссылке в письме для полноценного использования сайта.
        </div>
        <Button
          variant={"dark"}
          onClick={() => {
            userInterface.logout();
            onClose();
          }}
        >
          Log out
        </Button>
      </>
    );
  }

  return (
    <Formik
      initialValues={{
        first_name: "",
        second_name: "",
        email: "",
        phone: "",
        password: "",
        password2: "",
      }}
      onSubmit={handleSubmit}
      validate={handleValidate}
      validateOnChange={false}
    >
      {({ values, handleSubmit, errors, setFieldValue, validateForm }) => (
        <>
          {step === 0 ? (
            <>
              <h1 className="text-center">Регистрация</h1>
              <Form>
                {Object.entries(SIGN_UP_FIELDS).map(
                  ([name, { type, autoComplete, label }]) => (
                    <InputGroup key={name} hasValidation>
                      <Form.Group className="mb-3 w-100">
                        <Form.Label>{label}*</Form.Label>
                        <Form.Control
                          value={values[name]}
                          onChange={(e) => setFieldValue(name, e.target.value)}
                          type={type}
                          name={name}
                          autoComplete={autoComplete}
                          isInvalid={!!errors[name]}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              const errors = await validateForm();
                              if (!Object.keys(errors).length) {
                                setStep(1);
                              }
                            }
                          }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[name]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </InputGroup>
                  )
                )}
                {!!error && <div className={cn("error")}>{error}</div>}
                <div className="d-flex justify-content-center mt-4">
                  <Button
                    size={"lg"}
                    variant={"dark"}
                    onClick={async () => {
                      const errors = await validateForm();
                      if (!Object.keys(errors).length) {
                        setStep(1);
                      }
                    }}
                  >
                    Зарегестрироваться
                  </Button>
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <span className="text-secondary">Есть аккаунт?</span>&nbsp;
                  <span
                    className="text-dark cursor-pointer"
                    onClick={onSignInNavigate}
                  >
                    Войти
                  </span>
                </div>
              </Form>
            </>
          ) : (
            <div>
              <pre className={cn("rules-text")}>{text}</pre>
              <div className="d-flex justify-content-center mt-4">
                <Button
                  size={"lg"}
                  variant={"dark"}
                  onClick={() => {
                    handleSubmit();
                    setStep(1);
                  }}
                >
                  Я прочел и принимаю правила
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Formik>
  );
}

const text = `ПРАВИЛА ПРОВЕДЕНИЯ ТОРГОВ
Настоящие Правила регулируют отношения между участником торгов и/или покупателем (далее - Участник) лота или лотов (далее - Работа), предлагаемых аукционом “INSIGHT” (далее - Аукцион). Аукцион действует в качестве агента Продавца и уполномочен Продавцом заключить контракт с Участником на приобретение Работ.
Аукцион имеет право вносить изменения в настоящие Правила.
 
1. ПРЕДМЕТ АУКЦИОНА
1.1 Торги на Аукционе проводятся в электронной форме на сайте по адресу: http://insightauction.ru
1.2 Каждая Работа имеет описание (каталогизацию) и изображение, предоставленное Аукционом или Продавцом.
1.3 Аукцион полагается на то, что Продавец предоставляет точную информацию и изображения каждой из Работ. Участник, делая ставку на Аукционе, подтверждает, что удовлетворен состоянием, точностью описания и внешним видом каждой Работы.
1.4 Даты и время закрытия текущих торгов публикуются на сайте Аукциона
 
2. ТОРГИ И ПРИОБРЕТЕНИЕ
2.1 Участвовать в торгах Аукциона может любое дееспособное лицо, достигшее к дате проведения торгов восемнадцатилетнего возраста.
2.2 Каждый Участник, желающий принять участие в Аукционе, должен зарегистрироваться, предоставив соответствующую информацию: фамилию, имя, почтовый адрес и контактный телефон, по которому в будет вестись коммуникация между Участником и Аукционом. Личные данные Участника будут доступны только администрации Аукциона, см. п.6.
2.3 Регистрируясь для участия в торгах Аукциона, Участник признает, что будет связан настоящими Правилами.
2.4 Аукцион оставляет за собой право отказать в регистрации в качестве Участника любому лицу без объяснения причин.
 
3. ПРОВЕДЕНИЕ ТОРГОВ
3.1 Цены на выставленные Работы указаны в российских рублях.
3.2 В борьбе за лот выигрывает Участник, сделавший наибольшую ставку к моменту закрытия торгов или Участник выкупивший Работу во время проведения торгов, нажав на кнопку “Выкупить”.
3.3 Аукцион имеет право в любое время аннулировать ставку и снять любую Работу с торгов и/или повторно выставить Работу на продажу, если во время продажи Работы произошла техническая ошибка.
 
4. ПОРЯДОК ОПЛАТЫ
 4.1 С участником, выигравшим в торгах или выкупившим Работу, Аукцион обязан связаться в течение 3 (Трех) календарных дней и уведомить о результатах торгов по данной Работе и сумме к оплате. Сумма складывается из выигравшей ставки и комиссионного сбора в размере 10% от нее.
4.3 Если Участник выигравший в торгах или выкупивший Работу не отвечает на уведомления Аукциона в течение 2 (Двух) календарных дней, Аукцион оставляет за собой право аннулировать соглашение о покупке данной Работы и вернуть Работу владельцу и/или выставить на торги повторно.
4.4 Оплата выигранной в торгах или выкупленной Работы производится Участником в течение 2 (Двух) календарных дней с момента уведомления Аукциона о приобретении.
4.5 Если выигранная в торгах или выкупленная Работа не оплачена Участником  в надлежащий срок, то Работа автоматически считается непроданной и возвращается Продавцу или выставляется на торги повторно.
4.6 Все расходы связанные с оплатой Работы несет Участник.
4.7 Участник, не отвечающий на оповещения Аукциона в надлежащий срок или отказавшийся по любым причинам от оплаты выигранной или выкупленной им Работы получает полный запрет на участие в торгах Аукциона.
4.9 Оплата производится в российских рублях. 
 
5. ПОЛУЧЕНИЕ РАБОТЫ
5.1 Аукцион обязуется передать Работу Участнику после получения оплаты данной Работы и, в некоторых случаях, если это необходимо, после проверки соответствующей идентификации Участника, при этом расходы на транспортировку несет участник, см. п. 5.3
5.2 Выигранную или выкупленную Работу Участник обязан забрать в течение 7 (Семи) календарных дней после уведомления Аукциона о результатах торгов, при условии ее оплаты.
5.3 Все расходы по транспортировке Работ Участник оплачивает самостоятельно ​​
5.4 Аукцион не выдает Участнику разрешение на вывоз за пределы РФ Работ, приобретенных на Аукционе, и не гарантирует возможности получения такого разрешения.
 
6. ЗАЩИТА ПЕРСОНАЛЬНЫХ ДАННЫХ
6.1 Начав работу с сайтом: http://insightauction.ru, Участник выражает свое согласие на обработку персональных данных в соответствии с законом N 152-ФЗ «О персональных данных»..
6.2 Личные данные Участника будут доступны только администрации Аукциона.
6.3 Аукцион оставляет за собой право запросить Участника предоставить личные данные, не указанные в п. 2.2. Эти данные будут использоваться при выполнении обязательств для обеспечения соблюдения Правил, а также для улучшения деятельности Аукциона.
 
7. АВТОРСКИЕ ПРАВА
7.1 Авторские права на все изображения, иллюстрации и письменные материалы, созданные INSIGHT или Продавцом (включая любые логотипы и изображения), остаются собственностью INSIGHT или Продавцов, и такие изображения и материалы не могут быть использованы Участником или любой другой стороной без предварительного письменного согласия соответствующей стороны.
`;
