--
-- PostgreSQL database dump
--

\restrict EBMOnfeYVls4zSgOYsSFSqvYeo3SQmbr44hyOE8qcqCxzaEaiDR3l5mNN1omzUB

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-24 02:31:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id integer NOT NULL,
    patient_id integer NOT NULL,
    provider_id integer NOT NULL,
    reason character varying(255),
    notes text,
    status character varying(20) DEFAULT 'Pending'::character varying,
    appointment_datetime timestamp without time zone NOT NULL,
    payment_status character varying(20) DEFAULT 'Unpaid'::character varying,
    payment_intent_id character varying(255),
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Confirmed'::character varying)::text, ('Cancelled'::character varying)::text, ('Completed'::character varying)::text])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16400)
-- Name: appointments_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointment_id_seq OWNER TO postgres;

--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 220
-- Name: appointments_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments.appointment_id;


--
-- TOC entry 221 (class 1259 OID 16401)
-- Name: availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.availability (
    availability_id integer NOT NULL,
    provider_id integer NOT NULL,
    is_booked boolean DEFAULT false,
    slot_start timestamp without time zone NOT NULL,
    slot_end timestamp without time zone NOT NULL,
    CONSTRAINT chk_availability_time CHECK ((slot_end > slot_start))
);


ALTER TABLE public.availability OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16410)
-- Name: availability_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.availability_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.availability_availability_id_seq OWNER TO postgres;

--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 222
-- Name: availability_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.availability_availability_id_seq OWNED BY public.availability.availability_id;


--
-- TOC entry 223 (class 1259 OID 16411)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    appointment_id integer,
    message text NOT NULL,
    notification_type character varying(50),
    is_read boolean DEFAULT false,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (((notification_type)::text = ANY (ARRAY[('Confirmation'::character varying)::text, ('Reminder'::character varying)::text, ('Cancellation'::character varying)::text, ('Rescheduled'::character varying)::text])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16422)
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 224
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- TOC entry 225 (class 1259 OID 16423)
-- Name: provider_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_profiles (
    provider_id integer NOT NULL,
    profile_picture text,
    degree character varying(100),
    sex character varying(10),
    specialisation character varying(100),
    spoken_language character varying(255),
    bio text,
    consultation_fee integer DEFAULT 7500,
    CONSTRAINT provider_profiles_sex_check CHECK (((sex)::text = ANY (ARRAY[('Male'::character varying)::text, ('Female'::character varying)::text, ('Other'::character varying)::text])))
);


ALTER TABLE public.provider_profiles OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16430)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    report_id integer NOT NULL,
    generated_by integer NOT NULL,
    report_type character varying(50) NOT NULL,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    parameters text,
    output text,
    CONSTRAINT reports_report_type_check CHECK (((report_type)::text = ANY (ARRAY[('Appointments'::character varying)::text, ('Users'::character varying)::text, ('Providers'::character varying)::text, ('Revenue'::character varying)::text])))
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16440)
-- Name: reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_report_id_seq OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 227
-- Name: reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_report_id_seq OWNED BY public.reports.report_id;


--
-- TOC entry 228 (class 1259 OID 16441)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16446)
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 229
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 230 (class 1259 OID 16447)
-- Name: treatments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatments (
    treatment_id integer NOT NULL,
    patient_id integer NOT NULL,
    progress_percent integer DEFAULT 0,
    next_provider_id integer,
    treatment_notes text,
    next_appointment_datetime timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT treatments_progress_percent_check CHECK (((progress_percent >= 0) AND (progress_percent <= 100)))
);


ALTER TABLE public.treatments OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16457)
-- Name: treatments_treatment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treatments_treatment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.treatments_treatment_id_seq OWNER TO postgres;

--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 231
-- Name: treatments_treatment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treatments_treatment_id_seq OWNED BY public.treatments.treatment_id;


--
-- TOC entry 232 (class 1259 OID 16458)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(20),
    role_id integer NOT NULL,
    account_status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    first_name character varying(50) DEFAULT ''::character varying NOT NULL,
    last_name character varying(50) DEFAULT ''::character varying NOT NULL,
    date_of_birth date,
    address text,
    emergency_contact character varying(255),
    health_fund character varying(50),
    CONSTRAINT users_account_status_check CHECK (((account_status)::text = ANY (ARRAY[('Active'::character varying)::text, ('Inactive'::character varying)::text, ('Suspended'::character varying)::text]))),
    CONSTRAINT users_health_fund_check CHECK (((health_fund)::text = ANY ((ARRAY['Medicare'::character varying, 'Veteran Affairs'::character varying, 'Concession'::character varying, 'Private Insurance'::character varying, 'None'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16475)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 233
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4890 (class 2604 OID 16476)
-- Name: appointments appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 16477)
-- Name: availability availability_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability ALTER COLUMN availability_id SET DEFAULT nextval('public.availability_availability_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 16478)
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 16479)
-- Name: reports report_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN report_id SET DEFAULT nextval('public.reports_report_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16480)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 16481)
-- Name: treatments treatment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments ALTER COLUMN treatment_id SET DEFAULT nextval('public.treatments_treatment_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 16482)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5099 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, patient_id, provider_id, reason, notes, status, appointment_datetime, payment_status, payment_intent_id) FROM stdin;
4	4	2	General checkup	Long appointment	Cancelled	2026-05-02 15:00:00	Unpaid	\N
2	1	2	Follow up checkup	Patient presents with mild fever. Recommended rest and fluids.	Completed	2026-05-02 10:00:00	Unpaid	\N
1	1	2	General checkup	First time patient	Confirmed	2026-05-18 09:00:00	Unpaid	\N
5	9	2	General checkup	Long appointment	Confirmed	2026-05-06 12:31:00	Unpaid	\N
3	1	2	Follow up checkup	Second visit	Confirmed	2026-05-03 09:00:00	Unpaid	\N
6	9	2	Flu symptoms		Pending	2026-05-25 00:00:00	Unpaid	\N
7	9	2	Flu symptoms		Pending	2026-05-25 00:30:00	Unpaid	\N
8	9	2	Flu		Pending	2026-05-25 06:30:00	Unpaid	\N
9	9	2	Flu		Pending	2026-05-25 23:30:00	Paid	pi_3TaIHpJw2Ug1oyUQ1wMk5QCn
\.


--
-- TOC entry 5101 (class 0 OID 16401)
-- Dependencies: 221
-- Data for Name: availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.availability (availability_id, provider_id, is_booked, slot_start, slot_end) FROM stdin;
114	2	f	2026-06-02 04:00:00	2026-06-02 04:30:00
2	2	t	2026-05-02 10:00:00	2026-05-02 11:00:00
3	2	t	2026-05-03 09:00:00	2026-05-03 10:00:00
4	2	t	2026-05-01 10:00:00	2026-05-01 10:30:00
1	2	f	2026-05-01 09:00:00	2026-05-01 10:00:00
5	2	t	2026-05-18 09:00:00	2026-05-18 09:30:00
115	2	f	2026-06-02 04:30:00	2026-06-02 05:00:00
116	2	f	2026-06-02 05:00:00	2026-06-02 05:30:00
6	2	f	2026-05-06 12:00:00	2026-05-06 12:30:00
7	2	t	2026-05-06 12:31:00	2026-05-06 13:00:00
8	2	f	2026-05-24 23:00:00	2026-05-24 23:30:00
9	2	f	2026-05-24 23:30:00	2026-05-25 00:00:00
12	2	f	2026-05-25 01:00:00	2026-05-25 01:30:00
13	2	f	2026-05-25 01:30:00	2026-05-25 02:00:00
14	2	f	2026-05-25 02:00:00	2026-05-25 02:30:00
15	2	f	2026-05-25 02:30:00	2026-05-25 03:00:00
16	2	f	2026-05-25 03:00:00	2026-05-25 03:30:00
17	2	f	2026-05-25 03:30:00	2026-05-25 04:00:00
18	2	f	2026-05-25 04:00:00	2026-05-25 04:30:00
19	2	f	2026-05-25 04:30:00	2026-05-25 05:00:00
20	2	f	2026-05-25 05:00:00	2026-05-25 05:30:00
21	2	f	2026-05-25 05:30:00	2026-05-25 06:00:00
22	2	f	2026-05-25 06:00:00	2026-05-25 06:30:00
24	2	f	2026-05-25 23:00:00	2026-05-25 23:30:00
26	2	f	2026-05-26 00:00:00	2026-05-26 00:30:00
27	2	f	2026-05-26 00:30:00	2026-05-26 01:00:00
28	2	f	2026-05-26 01:00:00	2026-05-26 01:30:00
29	2	f	2026-05-26 01:30:00	2026-05-26 02:00:00
30	2	f	2026-05-26 02:00:00	2026-05-26 02:30:00
31	2	f	2026-05-26 02:30:00	2026-05-26 03:00:00
32	2	f	2026-05-26 03:00:00	2026-05-26 03:30:00
33	2	f	2026-05-26 03:30:00	2026-05-26 04:00:00
34	2	f	2026-05-26 04:00:00	2026-05-26 04:30:00
35	2	f	2026-05-26 04:30:00	2026-05-26 05:00:00
36	2	f	2026-05-26 05:00:00	2026-05-26 05:30:00
37	2	f	2026-05-26 05:30:00	2026-05-26 06:00:00
38	2	f	2026-05-26 06:00:00	2026-05-26 06:30:00
39	2	f	2026-05-26 06:30:00	2026-05-26 07:00:00
40	2	f	2026-05-26 23:00:00	2026-05-26 23:30:00
41	2	f	2026-05-26 23:30:00	2026-05-27 00:00:00
42	2	f	2026-05-27 00:00:00	2026-05-27 00:30:00
43	2	f	2026-05-27 00:30:00	2026-05-27 01:00:00
44	2	f	2026-05-27 01:00:00	2026-05-27 01:30:00
45	2	f	2026-05-27 01:30:00	2026-05-27 02:00:00
46	2	f	2026-05-27 02:00:00	2026-05-27 02:30:00
47	2	f	2026-05-27 02:30:00	2026-05-27 03:00:00
48	2	f	2026-05-27 03:00:00	2026-05-27 03:30:00
49	2	f	2026-05-27 03:30:00	2026-05-27 04:00:00
50	2	f	2026-05-27 04:00:00	2026-05-27 04:30:00
51	2	f	2026-05-27 04:30:00	2026-05-27 05:00:00
52	2	f	2026-05-27 05:00:00	2026-05-27 05:30:00
53	2	f	2026-05-27 05:30:00	2026-05-27 06:00:00
54	2	f	2026-05-27 06:00:00	2026-05-27 06:30:00
55	2	f	2026-05-27 06:30:00	2026-05-27 07:00:00
56	2	f	2026-05-27 23:00:00	2026-05-27 23:30:00
57	2	f	2026-05-27 23:30:00	2026-05-28 00:00:00
58	2	f	2026-05-28 00:00:00	2026-05-28 00:30:00
59	2	f	2026-05-28 00:30:00	2026-05-28 01:00:00
60	2	f	2026-05-28 01:00:00	2026-05-28 01:30:00
61	2	f	2026-05-28 01:30:00	2026-05-28 02:00:00
62	2	f	2026-05-28 02:00:00	2026-05-28 02:30:00
63	2	f	2026-05-28 02:30:00	2026-05-28 03:00:00
64	2	f	2026-05-28 03:00:00	2026-05-28 03:30:00
65	2	f	2026-05-28 03:30:00	2026-05-28 04:00:00
66	2	f	2026-05-28 04:00:00	2026-05-28 04:30:00
67	2	f	2026-05-28 04:30:00	2026-05-28 05:00:00
68	2	f	2026-05-28 05:00:00	2026-05-28 05:30:00
69	2	f	2026-05-28 05:30:00	2026-05-28 06:00:00
70	2	f	2026-05-28 06:00:00	2026-05-28 06:30:00
71	2	f	2026-05-28 06:30:00	2026-05-28 07:00:00
72	2	f	2026-05-28 23:00:00	2026-05-28 23:30:00
73	2	f	2026-05-28 23:30:00	2026-05-29 00:00:00
74	2	f	2026-05-29 00:00:00	2026-05-29 00:30:00
75	2	f	2026-05-29 00:30:00	2026-05-29 01:00:00
76	2	f	2026-05-29 01:00:00	2026-05-29 01:30:00
77	2	f	2026-05-29 01:30:00	2026-05-29 02:00:00
78	2	f	2026-05-29 02:00:00	2026-05-29 02:30:00
79	2	f	2026-05-29 02:30:00	2026-05-29 03:00:00
80	2	f	2026-05-29 03:00:00	2026-05-29 03:30:00
81	2	f	2026-05-29 03:30:00	2026-05-29 04:00:00
82	2	f	2026-05-29 04:00:00	2026-05-29 04:30:00
83	2	f	2026-05-29 04:30:00	2026-05-29 05:00:00
84	2	f	2026-05-29 05:00:00	2026-05-29 05:30:00
85	2	f	2026-05-29 05:30:00	2026-05-29 06:00:00
86	2	f	2026-05-29 06:00:00	2026-05-29 06:30:00
87	2	f	2026-05-29 06:30:00	2026-05-29 07:00:00
88	2	f	2026-05-31 23:00:00	2026-05-31 23:30:00
89	2	f	2026-05-31 23:30:00	2026-06-01 00:00:00
90	2	f	2026-06-01 00:00:00	2026-06-01 00:30:00
91	2	f	2026-06-01 00:30:00	2026-06-01 01:00:00
92	2	f	2026-06-01 01:00:00	2026-06-01 01:30:00
93	2	f	2026-06-01 01:30:00	2026-06-01 02:00:00
94	2	f	2026-06-01 02:00:00	2026-06-01 02:30:00
95	2	f	2026-06-01 02:30:00	2026-06-01 03:00:00
96	2	f	2026-06-01 03:00:00	2026-06-01 03:30:00
97	2	f	2026-06-01 03:30:00	2026-06-01 04:00:00
98	2	f	2026-06-01 04:00:00	2026-06-01 04:30:00
99	2	f	2026-06-01 04:30:00	2026-06-01 05:00:00
100	2	f	2026-06-01 05:00:00	2026-06-01 05:30:00
101	2	f	2026-06-01 05:30:00	2026-06-01 06:00:00
102	2	f	2026-06-01 06:00:00	2026-06-01 06:30:00
103	2	f	2026-06-01 06:30:00	2026-06-01 07:00:00
104	2	f	2026-06-01 23:00:00	2026-06-01 23:30:00
105	2	f	2026-06-01 23:30:00	2026-06-02 00:00:00
106	2	f	2026-06-02 00:00:00	2026-06-02 00:30:00
107	2	f	2026-06-02 00:30:00	2026-06-02 01:00:00
108	2	f	2026-06-02 01:00:00	2026-06-02 01:30:00
109	2	f	2026-06-02 01:30:00	2026-06-02 02:00:00
110	2	f	2026-06-02 02:00:00	2026-06-02 02:30:00
111	2	f	2026-06-02 02:30:00	2026-06-02 03:00:00
112	2	f	2026-06-02 03:00:00	2026-06-02 03:30:00
113	2	f	2026-06-02 03:30:00	2026-06-02 04:00:00
117	2	f	2026-06-02 05:30:00	2026-06-02 06:00:00
118	2	f	2026-06-02 06:00:00	2026-06-02 06:30:00
119	2	f	2026-06-02 06:30:00	2026-06-02 07:00:00
120	2	f	2026-06-02 23:00:00	2026-06-02 23:30:00
121	2	f	2026-06-02 23:30:00	2026-06-03 00:00:00
122	2	f	2026-06-03 00:00:00	2026-06-03 00:30:00
123	2	f	2026-06-03 00:30:00	2026-06-03 01:00:00
124	2	f	2026-06-03 01:00:00	2026-06-03 01:30:00
125	2	f	2026-06-03 01:30:00	2026-06-03 02:00:00
126	2	f	2026-06-03 02:00:00	2026-06-03 02:30:00
127	2	f	2026-06-03 02:30:00	2026-06-03 03:00:00
128	2	f	2026-06-03 03:00:00	2026-06-03 03:30:00
129	2	f	2026-06-03 03:30:00	2026-06-03 04:00:00
130	2	f	2026-06-03 04:00:00	2026-06-03 04:30:00
131	2	f	2026-06-03 04:30:00	2026-06-03 05:00:00
132	2	f	2026-06-03 05:00:00	2026-06-03 05:30:00
133	2	f	2026-06-03 05:30:00	2026-06-03 06:00:00
134	2	f	2026-06-03 06:00:00	2026-06-03 06:30:00
135	2	f	2026-06-03 06:30:00	2026-06-03 07:00:00
11	2	t	2026-05-25 00:30:00	2026-05-25 01:00:00
23	2	t	2026-05-25 06:30:00	2026-05-25 07:00:00
25	2	t	2026-05-25 23:30:00	2026-05-26 00:00:00
136	2	f	2026-06-03 23:00:00	2026-06-03 23:30:00
137	2	f	2026-06-03 23:30:00	2026-06-04 00:00:00
138	2	f	2026-06-04 00:00:00	2026-06-04 00:30:00
139	2	f	2026-06-04 00:30:00	2026-06-04 01:00:00
140	2	f	2026-06-04 01:00:00	2026-06-04 01:30:00
141	2	f	2026-06-04 01:30:00	2026-06-04 02:00:00
142	2	f	2026-06-04 02:00:00	2026-06-04 02:30:00
143	2	f	2026-06-04 02:30:00	2026-06-04 03:00:00
144	2	f	2026-06-04 03:00:00	2026-06-04 03:30:00
145	2	f	2026-06-04 03:30:00	2026-06-04 04:00:00
146	2	f	2026-06-04 04:00:00	2026-06-04 04:30:00
147	2	f	2026-06-04 04:30:00	2026-06-04 05:00:00
148	2	f	2026-06-04 05:00:00	2026-06-04 05:30:00
149	2	f	2026-06-04 05:30:00	2026-06-04 06:00:00
150	2	f	2026-06-04 06:00:00	2026-06-04 06:30:00
151	2	f	2026-06-04 06:30:00	2026-06-04 07:00:00
152	2	f	2026-06-04 23:00:00	2026-06-04 23:30:00
153	2	f	2026-06-04 23:30:00	2026-06-05 00:00:00
154	2	f	2026-06-05 00:00:00	2026-06-05 00:30:00
155	2	f	2026-06-05 00:30:00	2026-06-05 01:00:00
156	2	f	2026-06-05 01:00:00	2026-06-05 01:30:00
157	2	f	2026-06-05 01:30:00	2026-06-05 02:00:00
158	2	f	2026-06-05 02:00:00	2026-06-05 02:30:00
159	2	f	2026-06-05 02:30:00	2026-06-05 03:00:00
160	2	f	2026-06-05 03:00:00	2026-06-05 03:30:00
161	2	f	2026-06-05 03:30:00	2026-06-05 04:00:00
162	2	f	2026-06-05 04:00:00	2026-06-05 04:30:00
163	2	f	2026-06-05 04:30:00	2026-06-05 05:00:00
164	2	f	2026-06-05 05:00:00	2026-06-05 05:30:00
165	2	f	2026-06-05 05:30:00	2026-06-05 06:00:00
166	2	f	2026-06-05 06:00:00	2026-06-05 06:30:00
167	2	f	2026-06-05 06:30:00	2026-06-05 07:00:00
168	2	f	2026-06-07 23:00:00	2026-06-07 23:30:00
169	2	f	2026-06-07 23:30:00	2026-06-08 00:00:00
170	2	f	2026-06-08 00:00:00	2026-06-08 00:30:00
171	2	f	2026-06-08 00:30:00	2026-06-08 01:00:00
172	2	f	2026-06-08 01:00:00	2026-06-08 01:30:00
173	2	f	2026-06-08 01:30:00	2026-06-08 02:00:00
174	2	f	2026-06-08 02:00:00	2026-06-08 02:30:00
175	2	f	2026-06-08 02:30:00	2026-06-08 03:00:00
176	2	f	2026-06-08 03:00:00	2026-06-08 03:30:00
177	2	f	2026-06-08 03:30:00	2026-06-08 04:00:00
178	2	f	2026-06-08 04:00:00	2026-06-08 04:30:00
179	2	f	2026-06-08 04:30:00	2026-06-08 05:00:00
180	2	f	2026-06-08 05:00:00	2026-06-08 05:30:00
181	2	f	2026-06-08 05:30:00	2026-06-08 06:00:00
182	2	f	2026-06-08 06:00:00	2026-06-08 06:30:00
183	2	f	2026-06-08 06:30:00	2026-06-08 07:00:00
184	2	f	2026-06-08 23:00:00	2026-06-08 23:30:00
185	2	f	2026-06-08 23:30:00	2026-06-09 00:00:00
186	2	f	2026-06-09 00:00:00	2026-06-09 00:30:00
187	2	f	2026-06-09 00:30:00	2026-06-09 01:00:00
188	2	f	2026-06-09 01:00:00	2026-06-09 01:30:00
189	2	f	2026-06-09 01:30:00	2026-06-09 02:00:00
190	2	f	2026-06-09 02:00:00	2026-06-09 02:30:00
191	2	f	2026-06-09 02:30:00	2026-06-09 03:00:00
192	2	f	2026-06-09 03:00:00	2026-06-09 03:30:00
193	2	f	2026-06-09 03:30:00	2026-06-09 04:00:00
194	2	f	2026-06-09 04:00:00	2026-06-09 04:30:00
195	2	f	2026-06-09 04:30:00	2026-06-09 05:00:00
196	2	f	2026-06-09 05:00:00	2026-06-09 05:30:00
197	2	f	2026-06-09 05:30:00	2026-06-09 06:00:00
198	2	f	2026-06-09 06:00:00	2026-06-09 06:30:00
199	2	f	2026-06-09 06:30:00	2026-06-09 07:00:00
200	2	f	2026-06-09 23:00:00	2026-06-09 23:30:00
201	2	f	2026-06-09 23:30:00	2026-06-10 00:00:00
202	2	f	2026-06-10 00:00:00	2026-06-10 00:30:00
203	2	f	2026-06-10 00:30:00	2026-06-10 01:00:00
204	2	f	2026-06-10 01:00:00	2026-06-10 01:30:00
205	2	f	2026-06-10 01:30:00	2026-06-10 02:00:00
206	2	f	2026-06-10 02:00:00	2026-06-10 02:30:00
207	2	f	2026-06-10 02:30:00	2026-06-10 03:00:00
208	2	f	2026-06-10 03:00:00	2026-06-10 03:30:00
209	2	f	2026-06-10 03:30:00	2026-06-10 04:00:00
210	2	f	2026-06-10 04:00:00	2026-06-10 04:30:00
211	2	f	2026-06-10 04:30:00	2026-06-10 05:00:00
212	2	f	2026-06-10 05:00:00	2026-06-10 05:30:00
213	2	f	2026-06-10 05:30:00	2026-06-10 06:00:00
214	2	f	2026-06-10 06:00:00	2026-06-10 06:30:00
215	2	f	2026-06-10 06:30:00	2026-06-10 07:00:00
216	2	f	2026-06-10 23:00:00	2026-06-10 23:30:00
217	2	f	2026-06-10 23:30:00	2026-06-11 00:00:00
218	2	f	2026-06-11 00:00:00	2026-06-11 00:30:00
219	2	f	2026-06-11 00:30:00	2026-06-11 01:00:00
220	2	f	2026-06-11 01:00:00	2026-06-11 01:30:00
221	2	f	2026-06-11 01:30:00	2026-06-11 02:00:00
222	2	f	2026-06-11 02:00:00	2026-06-11 02:30:00
223	2	f	2026-06-11 02:30:00	2026-06-11 03:00:00
224	2	f	2026-06-11 03:00:00	2026-06-11 03:30:00
225	2	f	2026-06-11 03:30:00	2026-06-11 04:00:00
226	2	f	2026-06-11 04:00:00	2026-06-11 04:30:00
227	2	f	2026-06-11 04:30:00	2026-06-11 05:00:00
228	2	f	2026-06-11 05:00:00	2026-06-11 05:30:00
229	2	f	2026-06-11 05:30:00	2026-06-11 06:00:00
230	2	f	2026-06-11 06:00:00	2026-06-11 06:30:00
231	2	f	2026-06-11 06:30:00	2026-06-11 07:00:00
232	2	f	2026-06-11 23:00:00	2026-06-11 23:30:00
233	2	f	2026-06-11 23:30:00	2026-06-12 00:00:00
234	2	f	2026-06-12 00:00:00	2026-06-12 00:30:00
235	2	f	2026-06-12 00:30:00	2026-06-12 01:00:00
236	2	f	2026-06-12 01:00:00	2026-06-12 01:30:00
237	2	f	2026-06-12 01:30:00	2026-06-12 02:00:00
238	2	f	2026-06-12 02:00:00	2026-06-12 02:30:00
239	2	f	2026-06-12 02:30:00	2026-06-12 03:00:00
240	2	f	2026-06-12 03:00:00	2026-06-12 03:30:00
241	2	f	2026-06-12 03:30:00	2026-06-12 04:00:00
242	2	f	2026-06-12 04:00:00	2026-06-12 04:30:00
243	2	f	2026-06-12 04:30:00	2026-06-12 05:00:00
244	2	f	2026-06-12 05:00:00	2026-06-12 05:30:00
245	2	f	2026-06-12 05:30:00	2026-06-12 06:00:00
246	2	f	2026-06-12 06:00:00	2026-06-12 06:30:00
247	2	f	2026-06-12 06:30:00	2026-06-12 07:00:00
248	2	f	2026-06-14 23:00:00	2026-06-14 23:30:00
249	2	f	2026-06-14 23:30:00	2026-06-15 00:00:00
250	2	f	2026-06-15 00:00:00	2026-06-15 00:30:00
251	2	f	2026-06-15 00:30:00	2026-06-15 01:00:00
252	2	f	2026-06-15 01:00:00	2026-06-15 01:30:00
253	2	f	2026-06-15 01:30:00	2026-06-15 02:00:00
254	2	f	2026-06-15 02:00:00	2026-06-15 02:30:00
255	2	f	2026-06-15 02:30:00	2026-06-15 03:00:00
256	2	f	2026-06-15 03:00:00	2026-06-15 03:30:00
257	2	f	2026-06-15 03:30:00	2026-06-15 04:00:00
258	2	f	2026-06-15 04:00:00	2026-06-15 04:30:00
259	2	f	2026-06-15 04:30:00	2026-06-15 05:00:00
260	2	f	2026-06-15 05:00:00	2026-06-15 05:30:00
261	2	f	2026-06-15 05:30:00	2026-06-15 06:00:00
262	2	f	2026-06-15 06:00:00	2026-06-15 06:30:00
263	2	f	2026-06-15 06:30:00	2026-06-15 07:00:00
264	2	f	2026-06-15 23:00:00	2026-06-15 23:30:00
265	2	f	2026-06-15 23:30:00	2026-06-16 00:00:00
266	2	f	2026-06-16 00:00:00	2026-06-16 00:30:00
267	2	f	2026-06-16 00:30:00	2026-06-16 01:00:00
268	2	f	2026-06-16 01:00:00	2026-06-16 01:30:00
269	2	f	2026-06-16 01:30:00	2026-06-16 02:00:00
270	2	f	2026-06-16 02:00:00	2026-06-16 02:30:00
271	2	f	2026-06-16 02:30:00	2026-06-16 03:00:00
272	2	f	2026-06-16 03:00:00	2026-06-16 03:30:00
273	2	f	2026-06-16 03:30:00	2026-06-16 04:00:00
274	2	f	2026-06-16 04:00:00	2026-06-16 04:30:00
275	2	f	2026-06-16 04:30:00	2026-06-16 05:00:00
276	2	f	2026-06-16 05:00:00	2026-06-16 05:30:00
277	2	f	2026-06-16 05:30:00	2026-06-16 06:00:00
278	2	f	2026-06-16 06:00:00	2026-06-16 06:30:00
279	2	f	2026-06-16 06:30:00	2026-06-16 07:00:00
280	2	f	2026-06-16 23:00:00	2026-06-16 23:30:00
281	2	f	2026-06-16 23:30:00	2026-06-17 00:00:00
282	2	f	2026-06-17 00:00:00	2026-06-17 00:30:00
283	2	f	2026-06-17 00:30:00	2026-06-17 01:00:00
284	2	f	2026-06-17 01:00:00	2026-06-17 01:30:00
285	2	f	2026-06-17 01:30:00	2026-06-17 02:00:00
286	2	f	2026-06-17 02:00:00	2026-06-17 02:30:00
287	2	f	2026-06-17 02:30:00	2026-06-17 03:00:00
288	2	f	2026-06-17 03:00:00	2026-06-17 03:30:00
289	2	f	2026-06-17 03:30:00	2026-06-17 04:00:00
290	2	f	2026-06-17 04:00:00	2026-06-17 04:30:00
291	2	f	2026-06-17 04:30:00	2026-06-17 05:00:00
292	2	f	2026-06-17 05:00:00	2026-06-17 05:30:00
293	2	f	2026-06-17 05:30:00	2026-06-17 06:00:00
294	2	f	2026-06-17 06:00:00	2026-06-17 06:30:00
295	2	f	2026-06-17 06:30:00	2026-06-17 07:00:00
296	2	f	2026-06-17 23:00:00	2026-06-17 23:30:00
297	2	f	2026-06-17 23:30:00	2026-06-18 00:00:00
298	2	f	2026-06-18 00:00:00	2026-06-18 00:30:00
299	2	f	2026-06-18 00:30:00	2026-06-18 01:00:00
300	2	f	2026-06-18 01:00:00	2026-06-18 01:30:00
301	2	f	2026-06-18 01:30:00	2026-06-18 02:00:00
302	2	f	2026-06-18 02:00:00	2026-06-18 02:30:00
303	2	f	2026-06-18 02:30:00	2026-06-18 03:00:00
304	2	f	2026-06-18 03:00:00	2026-06-18 03:30:00
305	2	f	2026-06-18 03:30:00	2026-06-18 04:00:00
306	2	f	2026-06-18 04:00:00	2026-06-18 04:30:00
307	2	f	2026-06-18 04:30:00	2026-06-18 05:00:00
308	2	f	2026-06-18 05:00:00	2026-06-18 05:30:00
309	2	f	2026-06-18 05:30:00	2026-06-18 06:00:00
310	2	f	2026-06-18 06:00:00	2026-06-18 06:30:00
311	2	f	2026-06-18 06:30:00	2026-06-18 07:00:00
312	2	f	2026-06-18 23:00:00	2026-06-18 23:30:00
313	2	f	2026-06-18 23:30:00	2026-06-19 00:00:00
314	2	f	2026-06-19 00:00:00	2026-06-19 00:30:00
315	2	f	2026-06-19 00:30:00	2026-06-19 01:00:00
316	2	f	2026-06-19 01:00:00	2026-06-19 01:30:00
317	2	f	2026-06-19 01:30:00	2026-06-19 02:00:00
318	2	f	2026-06-19 02:00:00	2026-06-19 02:30:00
319	2	f	2026-06-19 02:30:00	2026-06-19 03:00:00
320	2	f	2026-06-19 03:00:00	2026-06-19 03:30:00
321	2	f	2026-06-19 03:30:00	2026-06-19 04:00:00
322	2	f	2026-06-19 04:00:00	2026-06-19 04:30:00
323	2	f	2026-06-19 04:30:00	2026-06-19 05:00:00
324	2	f	2026-06-19 05:00:00	2026-06-19 05:30:00
325	2	f	2026-06-19 05:30:00	2026-06-19 06:00:00
326	2	f	2026-06-19 06:00:00	2026-06-19 06:30:00
327	2	f	2026-06-19 06:30:00	2026-06-19 07:00:00
10	2	t	2026-05-25 00:00:00	2026-05-25 00:30:00
\.


--
-- TOC entry 5103 (class 0 OID 16411)
-- Dependencies: 223
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, user_id, appointment_id, message, notification_type, is_read, sent_at) FROM stdin;
2	1	3	Your appointment has been booked for Sun May 03 2026 09:00:00 GMT+1000 (Australian Eastern Standard Time)	Confirmation	f	2026-04-22 01:47:58.289235
3	2	3	You have a new appointment request from a patient	Confirmation	f	2026-04-22 01:47:58.296401
5	2	4	You have a new appointment request from a patient	Confirmation	f	2026-04-22 20:35:56.350053
6	1	1	Your appointment has been Confirmed	Confirmation	f	2026-04-22 20:46:27.187995
7	1	2	Your appointment has been Confirmed	Confirmation	f	2026-04-22 20:46:31.772912
8	4	4	Your appointment has been Confirmed	Confirmation	t	2026-04-22 20:46:35.087846
9	4	4	Your appointment has been cancelled	Cancellation	t	2026-04-22 20:51:19.615695
4	4	4	Your appointment has been booked for Fri May 01 2026 10:00:00 GMT+1000 (Australian Eastern Standard Time)	Confirmation	t	2026-04-22 20:35:56.346978
10	1	1	Your appointment has been rescheduled to Mon May 18 2026 09:00:00 GMT+1000 (Australian Eastern Standard Time)	Rescheduled	f	2026-04-22 22:11:08.714218
11	9	5	Your appointment has been booked for Wed May 06 2026 12:00:00 GMT+1000 (Australian Eastern Standard Time)	Confirmation	f	2026-05-03 18:55:07.463384
12	2	5	You have a new appointment request from a patient	Confirmation	f	2026-05-03 18:55:07.470061
13	9	5	Your appointment has been cancelled	Cancellation	f	2026-05-03 19:01:24.85188
14	9	5	Your appointment has been Confirmed	Confirmation	f	2026-05-03 19:05:35.228004
15	9	5	Your appointment has been rescheduled to Wed May 06 2026 12:31:00 GMT+1000 (Australian Eastern Standard Time)	Rescheduled	f	2026-05-03 19:23:08.401716
16	1	1	Your appointment has been Confirmed	Confirmation	f	2026-05-24 02:09:21.359158
17	9	5	Your appointment has been Confirmed	Confirmation	f	2026-05-24 02:09:22.418337
18	1	3	Your appointment has been Confirmed	Confirmation	f	2026-05-24 02:09:23.809775
19	9	6	Your appointment has been booked for Mon May 25 2026 00:00:00 GMT+1000 (Australian Eastern Standard Time)	Confirmation	f	2026-05-24 02:10:45.268849
20	2	6	You have a new appointment request from a patient	Confirmation	f	2026-05-24 02:10:45.273124
21	9	7	Your appointment has been booked for Mon May 25 2026 00:30:00 GMT+1000 (Australian Eastern Standard Time)	Confirmation	f	2026-05-24 02:11:53.768337
22	2	7	You have a new appointment request from a patient	Confirmation	f	2026-05-24 02:11:53.772448
23	9	8	Your appointment has been booked for Mon May 25 2026 06:30:00 GMT+1000 (Australian Eastern Standard Time)	Confirmation	f	2026-05-24 02:16:55.088623
24	2	8	You have a new appointment request from a patient	Confirmation	f	2026-05-24 02:16:55.092073
25	9	9	Your appointment has been booked for Mon May 25 2026 23:30:00 GMT+1000 (Australian Eastern Standard Time)	Confirmation	f	2026-05-24 02:20:25.557542
26	2	9	You have a new appointment request from a patient	Confirmation	f	2026-05-24 02:20:25.558745
\.


--
-- TOC entry 5105 (class 0 OID 16423)
-- Dependencies: 225
-- Data for Name: provider_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provider_profiles (provider_id, profile_picture, degree, sex, specialisation, spoken_language, bio, consultation_fee) FROM stdin;
10	\N	MBBS	Male	Cardiology	English	Experienced cardiologist with 15 years of practice	7500
2	\N	\N	Male	General Practice	English	10 years of experience in general practice.	7500
\.


--
-- TOC entry 5106 (class 0 OID 16430)
-- Dependencies: 226
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (report_id, generated_by, report_type, generated_at, parameters, output) FROM stdin;
1	7	Appointments	2026-04-22 21:03:03.538695	All appointments	{"total_appointments":"4","confirmed":"2","cancelled":"1","pending":"1","completed":"0"}
2	7	Users	2026-04-22 21:03:36.515717	All users	{"total_users":"5","total_patients":"2","total_providers":"2","active_users":"5","inactive_users":"0"}
3	7	Providers	2026-04-22 21:03:45.218987	All providers	[{"user_id":2,"first_name":"Dr Sarah","last_name":"Smith","specialisation":"General Practice","degree":"MBBS","total_appointments":"4"},{"user_id":6,"first_name":"Dr. Mark","last_name":"Taylor","specialisation":null,"degree":null,"total_appointments":"0"}]
4	7	Appointments	2026-05-23 12:49:18.213335	All appointments	{"total_appointments":"5","confirmed":"0","cancelled":"1","pending":"3","completed":"1"}
5	7	Users	2026-05-23 12:49:50.995219	All users	{"total_users":"11","total_patients":"7","total_providers":"3","active_users":"11","inactive_users":"0"}
6	7	Providers	2026-05-23 12:50:27.751464	All providers	[{"user_id":2,"first_name":"Dr Sarah","last_name":"Smith","specialisation":"General Practice","degree":"MBBS","total_appointments":"5"},{"user_id":6,"first_name":"Dr. Mark","last_name":"Taylor","specialisation":null,"degree":null,"total_appointments":"0"},{"user_id":10,"first_name":"Dr James","last_name":"Wilson","specialisation":"Cardiology","degree":"MBBS","total_appointments":"0"}]
\.


--
-- TOC entry 5108 (class 0 OID 16441)
-- Dependencies: 228
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name) FROM stdin;
1	Patient
2	Provider
3	Admin
\.


--
-- TOC entry 5110 (class 0 OID 16447)
-- Dependencies: 230
-- Data for Name: treatments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treatments (treatment_id, patient_id, progress_percent, next_provider_id, treatment_notes, next_appointment_datetime, created_at) FROM stdin;
\.


--
-- TOC entry 5112 (class 0 OID 16458)
-- Dependencies: 232
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash, phone, role_id, account_status, created_at, first_name, last_name, date_of_birth, address, emergency_contact, health_fund) FROM stdin;
6	mark@clinic.com	$2b$10$t2VydMaUtjLJshfElIZ2XesD/1BYd5eVUWP2RNfUFYWdJxwi5hN.6	0411111111	2	Active	2026-04-22 20:04:54.995216	Dr. Mark	Taylor	1980-03-10	456 Health Ave, Sydney	N/A	None
4	jane@example.com	$2b$10$1lBaDhRWujKDtBDXfriUUO81VIN4vREHiOVOLPn2GqISOkhK10Ndy	0412345678	1	Active	2026-04-22 19:58:00.242988	Jane	Smith	1990-05-15	123 Main St, Sydney	John Smith 0498765432	Medicare
8	test@example.com	$2b$10$d5ulgFVZfmhaseXw7A7Asu9B/KNe937ea6lxEvV1ZoaxsQ.n1wQuK	\N	1	Active	2026-04-22 21:22:31.414573	Test	User	\N	\N	\N	\N
9	vincark19@gmail.com	$2b$10$jQqI1YPrvFSFCkOd.livlumeXaVKd8ottbRUJeSGG0nTTSmY0AW92	\N	1	Active	2026-05-03 18:42:24.291902	Vinca	Kurniawan	\N	\N	\N	\N
7	admin@telehealth.com	$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	0422222222	3	Active	2026-04-22 20:14:23.430557	Kaveh	Sumeru	1997-07-09	Treasures Street, Sumeru City	Alhaitham 0433333333	None
10	james@example.com	$2b$10$UhDgzOY1sHHxn3oPXQjBXeB9zbB8JrKtLOd.965yjF7OPNSOJnb..	0433333333	2	Active	2026-05-17 00:11:48.611744	Dr James	Wilson	\N	\N	\N	\N
1	john@example.com	$2b$10$lO6MXGw3WrXMAfx3IEw0K.IqypLmw/tKQSK/OWmmBRlTiVGIRBwrW	0498765432	1	Active	2026-04-22 00:20:47.156275	John	Doe	1990-01-01	123 Main St, Sydney	Jane Doe 0498765432	Medicare
12	k221268@student.kent.com.au	$2b$10$19Bffm/RkkT4wpotMTnTzOk1vWnk/dXPT5voKBSaTZEeVP9oftQgy	\N	1	Active	2026-05-20 14:42:44.966733	Vinca R	Kurniawan	\N	\N	\N	\N
13	sidehmch@gmail.com	$2b$10$9fZxzbhw.kpzdoUC9aMnge6HfuHzP6DSjrdS0KYDKTRZjZdKILTym	\N	1	Active	2026-05-20 14:45:53.612493	Lemon	Ade	\N	\N	\N	\N
14	kazuha@test.com	$2b$10$c203aliBD6jUSYEkP5IBROcY39.Lw6tq8xr5HjM0thz9rhMETo4jq	\N	1	Active	2026-05-23 12:38:11.864565	Kazuha	Kaedehara	\N	\N	\N	\N
15	kokomi@inazuma.com	$2b$10$R/c3/KlIfKkFfwGfRkIEwuqvfPDi9CxpGKGJL/af9RTb.2UX6anmS	\N	1	Active	2026-05-23 13:02:47.552117			\N	\N	\N	\N
16	furina@fontaine.com	$2b$10$MA2mAkE187zl3AlEqbvOiOlV.HvclWeyBylM0cCb8cEM.Y9CFaSgq	\N	1	Active	2026-05-23 13:21:33.256321			\N	\N	\N	\N
17	wriothesley@fontaine.com	$2b$10$vhr.xJiS8paqt9eoCNY53eRX68rBiNdsKyKkRJvxk7QgTYf8EzMK.	0411222333	1	Active	2026-05-23 13:27:03.794164			\N	Fortress of Meropide, Fontaine	Vinca, spouse, 0422333444	Medicare
18	neuvillette@fontaine.com	$2b$10$HlsAYrty0E.lb0bsrEqD4uk5p1CXB5faquifG0lHSehRzd9wHJLvC	0400111222	1	Active	2026-05-23 13:59:57.192201	Neuvillette	de Justice	1973-12-18	Palais Mermonia	Sedane	Medicare
2	sarah@example.com	$2b$10$BcIPaNPKHL.vf.iizU2eC.A8XbtVqd9IFpWufOGDwriPudYxICFwG	0411111111	2	Active	2026-04-22 00:45:28.924497	Dr Sarah	Smith	1985-05-15	456 Medical Ave, Melbourne	John Smith 0422222222	Medicare
\.


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 220
-- Name: appointments_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_appointment_id_seq', 9, true);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 222
-- Name: availability_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.availability_availability_id_seq', 327, true);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 224
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 26, true);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 227
-- Name: reports_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_report_id_seq', 6, true);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 229
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 3, true);


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 231
-- Name: treatments_treatment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.treatments_treatment_id_seq', 1, false);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 233
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 18, true);


--
-- TOC entry 4919 (class 2606 OID 16484)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- TOC entry 4925 (class 2606 OID 16486)
-- Name: availability availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_pkey PRIMARY KEY (availability_id);


--
-- TOC entry 4927 (class 2606 OID 16488)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 4929 (class 2606 OID 16490)
-- Name: provider_profiles provider_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_pkey PRIMARY KEY (provider_id);


--
-- TOC entry 4931 (class 2606 OID 16492)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- TOC entry 4933 (class 2606 OID 16494)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 4935 (class 2606 OID 16496)
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 4937 (class 2606 OID 16498)
-- Name: treatments treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_pkey PRIMARY KEY (treatment_id);


--
-- TOC entry 4921 (class 2606 OID 16500)
-- Name: appointments uq_patient_datetime; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT uq_patient_datetime UNIQUE (patient_id, appointment_datetime);


--
-- TOC entry 4923 (class 2606 OID 16502)
-- Name: appointments uq_provider_datetime; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT uq_provider_datetime UNIQUE (provider_id, appointment_datetime);


--
-- TOC entry 4939 (class 2606 OID 16504)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4941 (class 2606 OID 16506)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4942 (class 2606 OID 16507)
-- Name: appointments fk_appointments_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4943 (class 2606 OID 16512)
-- Name: appointments fk_appointments_provider; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_provider FOREIGN KEY (provider_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4944 (class 2606 OID 16517)
-- Name: availability fk_availability_provider; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT fk_availability_provider FOREIGN KEY (provider_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4945 (class 2606 OID 16522)
-- Name: notifications fk_notifications_appointment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id) ON DELETE SET NULL;


--
-- TOC entry 4946 (class 2606 OID 16527)
-- Name: notifications fk_notifications_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4949 (class 2606 OID 16532)
-- Name: treatments fk_treatments_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT fk_treatments_patient FOREIGN KEY (patient_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4950 (class 2606 OID 16537)
-- Name: treatments fk_treatments_provider; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT fk_treatments_provider FOREIGN KEY (next_provider_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 4951 (class 2606 OID 16542)
-- Name: users fk_users_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE RESTRICT;


--
-- TOC entry 4947 (class 2606 OID 16547)
-- Name: provider_profiles provider_profiles_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4948 (class 2606 OID 16552)
-- Name: reports reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(user_id) ON DELETE CASCADE;


-- Completed on 2026-05-24 02:31:59

--
-- PostgreSQL database dump complete
--

\unrestrict EBMOnfeYVls4zSgOYsSFSqvYeo3SQmbr44hyOE8qcqCxzaEaiDR3l5mNN1omzUB

