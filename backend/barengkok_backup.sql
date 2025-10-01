--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: lamp_monitoring; Type: TABLE; Schema: public; Owner: cxianz
--

CREATE TABLE public.lamp_monitoring (
    id integer NOT NULL,
    lamp_id integer NOT NULL,
    battery_capacity double precision NOT NULL,
    input_current double precision NOT NULL,
    light_intensity double precision NOT NULL,
    battery_usage double precision NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.lamp_monitoring OWNER TO cxianz;

--
-- Name: lamp_monitoring_id_seq; Type: SEQUENCE; Schema: public; Owner: cxianz
--

CREATE SEQUENCE public.lamp_monitoring_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lamp_monitoring_id_seq OWNER TO cxianz;

--
-- Name: lamp_monitoring_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cxianz
--

ALTER SEQUENCE public.lamp_monitoring_id_seq OWNED BY public.lamp_monitoring.id;


--
-- Name: lamps; Type: TABLE; Schema: public; Owner: cxianz
--

CREATE TABLE public.lamps (
    id integer NOT NULL,
    name character varying(255),
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.lamps OWNER TO cxianz;

--
-- Name: lamps_id_seq; Type: SEQUENCE; Schema: public; Owner: cxianz
--

CREATE SEQUENCE public.lamps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lamps_id_seq OWNER TO cxianz;

--
-- Name: lamps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cxianz
--

ALTER SEQUENCE public.lamps_id_seq OWNED BY public.lamps.id;


--
-- Name: tank_monitoring; Type: TABLE; Schema: public; Owner: cxianz
--

CREATE TABLE public.tank_monitoring (
    id integer NOT NULL,
    tank_id integer NOT NULL,
    turbidity integer,
    ph double precision,
    volume double precision,
    created_at timestamp with time zone
);


ALTER TABLE public.tank_monitoring OWNER TO cxianz;

--
-- Name: tank_monitoring_id_seq; Type: SEQUENCE; Schema: public; Owner: cxianz
--

CREATE SEQUENCE public.tank_monitoring_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tank_monitoring_id_seq OWNER TO cxianz;

--
-- Name: tank_monitoring_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cxianz
--

ALTER SEQUENCE public.tank_monitoring_id_seq OWNED BY public.tank_monitoring.id;


--
-- Name: tanks; Type: TABLE; Schema: public; Owner: cxianz
--

CREATE TABLE public.tanks (
    id integer NOT NULL,
    name character varying(255),
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.tanks OWNER TO cxianz;

--
-- Name: tanks_id_seq; Type: SEQUENCE; Schema: public; Owner: cxianz
--

CREATE SEQUENCE public.tanks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tanks_id_seq OWNER TO cxianz;

--
-- Name: tanks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cxianz
--

ALTER SEQUENCE public.tanks_id_seq OWNED BY public.tanks.id;


--
-- Name: lamp_monitoring id; Type: DEFAULT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.lamp_monitoring ALTER COLUMN id SET DEFAULT nextval('public.lamp_monitoring_id_seq'::regclass);


--
-- Name: lamps id; Type: DEFAULT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.lamps ALTER COLUMN id SET DEFAULT nextval('public.lamps_id_seq'::regclass);


--
-- Name: tank_monitoring id; Type: DEFAULT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.tank_monitoring ALTER COLUMN id SET DEFAULT nextval('public.tank_monitoring_id_seq'::regclass);


--
-- Name: tanks id; Type: DEFAULT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.tanks ALTER COLUMN id SET DEFAULT nextval('public.tanks_id_seq'::regclass);


--
-- Data for Name: lamp_monitoring; Type: TABLE DATA; Schema: public; Owner: cxianz
--

COPY public.lamp_monitoring (id, lamp_id, battery_capacity, input_current, light_intensity, battery_usage, created_at) FROM stdin;
\.


--
-- Data for Name: lamps; Type: TABLE DATA; Schema: public; Owner: cxianz
--

COPY public.lamps (id, name, latitude, longitude) FROM stdin;
1	Lampu Kandang Kambing	-6.429482	106.473145
2	Lampu Jl. Bangeon 1	-6.425164	106.479068
3	Lampu WC Umum	-6.423842	106.478478
4	Lampu Tikungan Jembatan Cublek	-6.42273	106.462476
5	Lampu SD 1	-6.441986	106.477156
6	Lampu SD 2	-6.442215	106.477124
\.


--
-- Data for Name: tank_monitoring; Type: TABLE DATA; Schema: public; Owner: cxianz
--

COPY public.tank_monitoring (id, tank_id, turbidity, ph, volume, created_at) FROM stdin;
\.


--
-- Data for Name: tanks; Type: TABLE DATA; Schema: public; Owner: cxianz
--

COPY public.tanks (id, name, latitude, longitude) FROM stdin;
1	Toren Air 1	-6.427359	106.481515
2	Toren Air 2	-6.431852	106.470744
\.


--
-- Name: lamp_monitoring_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cxianz
--

SELECT pg_catalog.setval('public.lamp_monitoring_id_seq', 1, false);


--
-- Name: lamps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cxianz
--

SELECT pg_catalog.setval('public.lamps_id_seq', 6, true);


--
-- Name: tank_monitoring_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cxianz
--

SELECT pg_catalog.setval('public.tank_monitoring_id_seq', 1, false);


--
-- Name: tanks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cxianz
--

SELECT pg_catalog.setval('public.tanks_id_seq', 2, true);


--
-- Name: lamp_monitoring lamp_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.lamp_monitoring
    ADD CONSTRAINT lamp_monitoring_pkey PRIMARY KEY (id);


--
-- Name: lamps lamps_pkey; Type: CONSTRAINT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.lamps
    ADD CONSTRAINT lamps_pkey PRIMARY KEY (id);


--
-- Name: tank_monitoring tank_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.tank_monitoring
    ADD CONSTRAINT tank_monitoring_pkey PRIMARY KEY (id);


--
-- Name: tanks tanks_pkey; Type: CONSTRAINT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.tanks
    ADD CONSTRAINT tanks_pkey PRIMARY KEY (id);


--
-- Name: lamp_monitoring lamp_monitoring_lamp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.lamp_monitoring
    ADD CONSTRAINT lamp_monitoring_lamp_id_fkey FOREIGN KEY (lamp_id) REFERENCES public.lamps(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tank_monitoring tank_monitoring_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cxianz
--

ALTER TABLE ONLY public.tank_monitoring
    ADD CONSTRAINT tank_monitoring_tank_id_fkey FOREIGN KEY (tank_id) REFERENCES public.tanks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

