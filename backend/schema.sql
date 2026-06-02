CREATE TABLE public.ai_action_logs (
    id integer NOT NULL,
    module_name character varying(100),
    reference_id character varying(50),
    action_taken text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ai_action_logs OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 17318)
-- Name: ai_action_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_action_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_action_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5436 (class 0 OID 0)
-- Dependencies: 272
-- Name: ai_action_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_action_logs_id_seq OWNED BY public.ai_action_logs.id;


--
-- TOC entry 270 (class 1259 OID 17302)
-- Name: ai_modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_modules (
    module_id integer NOT NULL,
    module_name character varying(100),
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    description text
);


ALTER TABLE public.ai_modules OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 17301)
-- Name: ai_modules_module_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_modules_module_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_modules_module_id_seq OWNER TO postgres;

--
-- TOC entry 5437 (class 0 OID 0)
-- Dependencies: 269
-- Name: ai_modules_module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_modules_module_id_seq OWNED BY public.ai_modules.module_id;


--
-- TOC entry 305 (class 1259 OID 17487)
-- Name: ai_predictions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_predictions (
    id integer NOT NULL,
    appointment_id character varying(20),
    prediction_type character varying(50),
    prediction_details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ai_predictions OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 17486)
-- Name: ai_predictions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_predictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_predictions_id_seq OWNER TO postgres;

--
-- TOC entry 5438 (class 0 OID 0)
-- Dependencies: 304
-- Name: ai_predictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_predictions_id_seq OWNED BY public.ai_predictions.id;


--
-- TOC entry 271 (class 1259 OID 17312)
-- Name: ai_usage_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_usage_stats (
    stat_date date NOT NULL,
    predictions_made integer,
    accuracy_percent integer,
    hours_saved integer,
    cost_savings numeric(12,2)
);


ALTER TABLE public.ai_usage_stats OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 17463)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id character varying(20) NOT NULL,
    patient_id character varying(20),
    doctor_id character varying(20),
    appointment_date date,
    appointment_time time without time zone,
    type character varying(50),
    mode character varying(20),
    status character varying(20),
    ai_risk_level character varying(20),
    consult_duration integer,
    earnings numeric(10,2)
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 17408)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    log_id integer NOT NULL,
    user_name character varying(100),
    action text,
    resource character varying(100),
    ip_address character varying(50),
    status character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 17407)
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_log_id_seq OWNER TO postgres;

--
-- TOC entry 5439 (class 0 OID 0)
-- Dependencies: 290
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- TOC entry 224 (class 1259 OID 16694)
-- Name: clinic_doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_doctors (
    id integer NOT NULL,
    clinic_id integer,
    full_name character varying(150) NOT NULL,
    qualification character varying(100),
    council_number character varying(100),
    experience_years integer,
    specialization character varying(100),
    languages_known text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clinic_doctors OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16693)
-- Name: clinic_doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinic_doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinic_doctors_id_seq OWNER TO postgres;

--
-- TOC entry 5440 (class 0 OID 0)
-- Dependencies: 223
-- Name: clinic_doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinic_doctors_id_seq OWNED BY public.clinic_doctors.id;


--
-- TOC entry 222 (class 1259 OID 16676)
-- Name: clinic_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_documents (
    id integer NOT NULL,
    clinic_id integer,
    document_type character varying(100) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(20),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clinic_documents OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16675)
-- Name: clinic_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinic_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinic_documents_id_seq OWNER TO postgres;

--
-- TOC entry 5441 (class 0 OID 0)
-- Dependencies: 221
-- Name: clinic_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinic_documents_id_seq OWNED BY public.clinic_documents.id;


--
-- TOC entry 228 (class 1259 OID 16725)
-- Name: clinic_facilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_facilities (
    id integer NOT NULL,
    clinic_id integer,
    facility_name character varying(100)
);


ALTER TABLE public.clinic_facilities OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16724)
-- Name: clinic_facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinic_facilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinic_facilities_id_seq OWNER TO postgres;

--
-- TOC entry 5442 (class 0 OID 0)
-- Dependencies: 227
-- Name: clinic_facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinic_facilities_id_seq OWNED BY public.clinic_facilities.id;


--
-- TOC entry 230 (class 1259 OID 16738)
-- Name: clinic_payment_modes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_payment_modes (
    id integer NOT NULL,
    clinic_id integer,
    payment_mode character varying(50)
);


ALTER TABLE public.clinic_payment_modes OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16737)
-- Name: clinic_payment_modes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinic_payment_modes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinic_payment_modes_id_seq OWNER TO postgres;

--
-- TOC entry 5443 (class 0 OID 0)
-- Dependencies: 229
-- Name: clinic_payment_modes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinic_payment_modes_id_seq OWNED BY public.clinic_payment_modes.id;


--
-- TOC entry 226 (class 1259 OID 16711)
-- Name: clinic_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_services (
    id integer NOT NULL,
    clinic_id integer,
    service_type character varying(100),
    consultation_mode character varying(50),
    fee_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clinic_services OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16710)
-- Name: clinic_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinic_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinic_services_id_seq OWNER TO postgres;

--
-- TOC entry 5444 (class 0 OID 0)
-- Dependencies: 225
-- Name: clinic_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinic_services_id_seq OWNED BY public.clinic_services.id;


--
-- TOC entry 220 (class 1259 OID 16647)
-- Name: clinics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinics (
    id integer NOT NULL,
    clinic_name character varying(150) NOT NULL,
    establishment_year integer,
    tagline character varying(200),
    description text,
    address text NOT NULL,
    landmark character varying(150),
    pin_code character(6) NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    mobile character(10) NOT NULL,
    email character varying(150) NOT NULL,
    website character varying(200),
    mobile_verified boolean DEFAULT false,
    email_verified boolean DEFAULT false,
    medical_council_reg_no character varying(100) NOT NULL,
    bank_account_name character varying(150),
    bank_account_number character varying(50),
    ifsc_code character varying(20),
    pan_number character(10),
    gstin character(15),
    terms_accepted boolean DEFAULT false,
    declaration_accepted boolean DEFAULT false,
    verification_status character varying(30) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT clinics_description_check CHECK ((char_length(description) <= 500)),
    CONSTRAINT clinics_establishment_year_check CHECK ((establishment_year >= 1900))
);


ALTER TABLE public.clinics OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16646)
-- Name: clinics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinics_id_seq OWNER TO postgres;

--
-- TOC entry 5445 (class 0 OID 0)
-- Dependencies: 219
-- Name: clinics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinics_id_seq OWNED BY public.clinics.id;


--
-- TOC entry 247 (class 1259 OID 17032)
-- Name: dashboard_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_metrics (
    metric_date date NOT NULL,
    total_appointments integer,
    total_revenue numeric(10,2),
    active_patients integer,
    pending_payments integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dashboard_metrics OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 17455)
-- Name: data_backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_backups (
    backup_id integer NOT NULL,
    backup_time timestamp without time zone,
    backup_type character varying(20),
    status character varying(20)
);


ALTER TABLE public.data_backups OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 17454)
-- Name: data_backups_backup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.data_backups_backup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_backups_backup_id_seq OWNER TO postgres;

--
-- TOC entry 5446 (class 0 OID 0)
-- Dependencies: 298
-- Name: data_backups_backup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.data_backups_backup_id_seq OWNED BY public.data_backups.backup_id;


--
-- TOC entry 242 (class 1259 OID 16839)
-- Name: doctor_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_availability (
    id integer NOT NULL,
    doctor_id integer,
    day_of_week character varying(10),
    consultation_fee numeric(10,2),
    followup_fee numeric(10,2)
);


ALTER TABLE public.doctor_availability OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16838)
-- Name: doctor_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_availability_id_seq OWNER TO postgres;

--
-- TOC entry 5447 (class 0 OID 0)
-- Dependencies: 241
-- Name: doctor_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_availability_id_seq OWNED BY public.doctor_availability.id;


--
-- TOC entry 244 (class 1259 OID 16852)
-- Name: doctor_consultation_modes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_consultation_modes (
    id integer NOT NULL,
    doctor_id integer,
    mode character varying(50)
);


ALTER TABLE public.doctor_consultation_modes OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16851)
-- Name: doctor_consultation_modes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_consultation_modes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_consultation_modes_id_seq OWNER TO postgres;

--
-- TOC entry 5448 (class 0 OID 0)
-- Dependencies: 243
-- Name: doctor_consultation_modes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_consultation_modes_id_seq OWNED BY public.doctor_consultation_modes.id;


--
-- TOC entry 238 (class 1259 OID 16806)
-- Name: doctor_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_documents (
    id integer NOT NULL,
    doctor_id integer,
    document_type character varying(100) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(20),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor_documents OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16805)
-- Name: doctor_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_documents_id_seq OWNER TO postgres;

--
-- TOC entry 5449 (class 0 OID 0)
-- Dependencies: 237
-- Name: doctor_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_documents_id_seq OWNED BY public.doctor_documents.id;


--
-- TOC entry 236 (class 1259 OID 16792)
-- Name: doctor_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_languages (
    id integer NOT NULL,
    doctor_id integer,
    language character varying(50) NOT NULL
);


ALTER TABLE public.doctor_languages OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16791)
-- Name: doctor_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_languages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_languages_id_seq OWNER TO postgres;

--
-- TOC entry 5450 (class 0 OID 0)
-- Dependencies: 235
-- Name: doctor_languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_languages_id_seq OWNED BY public.doctor_languages.id;


--
-- TOC entry 267 (class 1259 OID 17291)
-- Name: doctor_performance_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_performance_reports (
    doctor_id character varying(20) NOT NULL,
    report_month character varying(7) NOT NULL,
    consultations integer,
    revenue_generated numeric(12,2),
    avg_rating numeric(3,2),
    performance_percent integer
);


ALTER TABLE public.doctor_performance_reports OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16824)
-- Name: doctor_practice_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_practice_locations (
    id integer NOT NULL,
    doctor_id integer,
    clinic_name character varying(150),
    address text,
    city character varying(100),
    state character varying(100),
    pin_code character(6)
);


ALTER TABLE public.doctor_practice_locations OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16823)
-- Name: doctor_practice_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_practice_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_practice_locations_id_seq OWNER TO postgres;

--
-- TOC entry 5451 (class 0 OID 0)
-- Dependencies: 239
-- Name: doctor_practice_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_practice_locations_id_seq OWNED BY public.doctor_practice_locations.id;


--
-- TOC entry 246 (class 1259 OID 16865)
-- Name: doctor_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_services (
    id integer NOT NULL,
    doctor_id integer,
    service_name character varying(100)
);


ALTER TABLE public.doctor_services OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16864)
-- Name: doctor_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_services_id_seq OWNER TO postgres;

--
-- TOC entry 5452 (class 0 OID 0)
-- Dependencies: 245
-- Name: doctor_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_services_id_seq OWNED BY public.doctor_services.id;


--
-- TOC entry 234 (class 1259 OID 16778)
-- Name: doctor_specializations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_specializations (
    id integer NOT NULL,
    doctor_id integer,
    specialization character varying(100) NOT NULL
);


ALTER TABLE public.doctor_specializations OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16777)
-- Name: doctor_specializations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_specializations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_specializations_id_seq OWNER TO postgres;

--
-- TOC entry 5453 (class 0 OID 0)
-- Dependencies: 233
-- Name: doctor_specializations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_specializations_id_seq OWNED BY public.doctor_specializations.id;


--
-- TOC entry 232 (class 1259 OID 16752)
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    full_name character varying(150) NOT NULL,
    date_of_birth date,
    profile_photo_url text,
    mobile character(10) NOT NULL,
    email character varying(150) NOT NULL,
    mobile_verified boolean DEFAULT false,
    email_verified boolean DEFAULT false,
    medical_council_reg_no character varying(100) NOT NULL,
    medical_council_name character varying(150),
    registration_year integer,
    qualifications text,
    university_name character varying(150),
    graduation_year integer,
    experience_years integer,
    bio text,
    bank_account_name character varying(150),
    bank_account_number character varying(50),
    ifsc_code character varying(20),
    pan_number character(10),
    gstin character(15),
    terms_accepted boolean DEFAULT false,
    declaration_accepted boolean DEFAULT false,
    verification_status character varying(30) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctors_bio_check CHECK ((char_length(bio) <= 200))
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16751)
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- TOC entry 5454 (class 0 OID 0)
-- Dependencies: 231
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- TOC entry 254 (class 1259 OID 17206)
-- Name: external_prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_prescriptions (
    id integer NOT NULL,
    patient_id character varying(20),
    file_url text,
    file_type character varying(10),
    notes text,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.external_prescriptions OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17205)
-- Name: external_prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_prescriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_prescriptions_id_seq OWNER TO postgres;

--
-- TOC entry 5455 (class 0 OID 0)
-- Dependencies: 253
-- Name: external_prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_prescriptions_id_seq OWNED BY public.external_prescriptions.id;


--
-- TOC entry 303 (class 1259 OID 17480)
-- Name: insurance_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insurance_policies (
    insurance_id character varying(20) NOT NULL,
    provider_name character varying(100),
    policy_number character varying(50),
    coverage_amount numeric(12,2),
    expiry_date date
);


ALTER TABLE public.insurance_policies OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 17247)
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id integer NOT NULL,
    invoice_id character varying(20),
    service_name character varying(100),
    quantity integer,
    rate numeric(10,2),
    amount numeric(10,2)
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17246)
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_items_id_seq OWNER TO postgres;

--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 259
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- TOC entry 262 (class 1259 OID 17255)
-- Name: invoice_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_payments (
    payment_id integer NOT NULL,
    invoice_id character varying(20),
    payment_mode character varying(20),
    paid_amount numeric(10,2),
    payment_date date DEFAULT CURRENT_DATE
);


ALTER TABLE public.invoice_payments OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17254)
-- Name: invoice_payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_payments_payment_id_seq OWNER TO postgres;

--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 261
-- Name: invoice_payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_payments_payment_id_seq OWNED BY public.invoice_payments.payment_id;


--
-- TOC entry 258 (class 1259 OID 17237)
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    invoice_id character varying(20) NOT NULL,
    patient_id character varying(20),
    invoice_date date,
    total_amount numeric(10,2),
    discount numeric(10,2) DEFAULT 0,
    status character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['Paid'::character varying, 'Pending'::character varying, 'Partial'::character varying])::text[])))
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 17344)
-- Name: iot_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iot_alerts (
    alert_id integer NOT NULL,
    patient_id character varying(20),
    device_id character varying(50),
    alert_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.iot_alerts OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 17343)
-- Name: iot_alerts_alert_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.iot_alerts_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.iot_alerts_alert_id_seq OWNER TO postgres;

--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 277
-- Name: iot_alerts_alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.iot_alerts_alert_id_seq OWNED BY public.iot_alerts.alert_id;


--
-- TOC entry 274 (class 1259 OID 17329)
-- Name: iot_devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iot_devices (
    device_id character varying(50) NOT NULL,
    device_type character varying(50),
    device_model character varying(100),
    patient_id character varying(20),
    status character varying(20),
    battery_percent integer,
    last_sync timestamp without time zone
);


ALTER TABLE public.iot_devices OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 17336)
-- Name: iot_readings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iot_readings (
    id integer NOT NULL,
    device_id character varying(50),
    reading_type character varying(50),
    reading_value character varying(50),
    reading_time timestamp without time zone
);


ALTER TABLE public.iot_readings OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 17335)
-- Name: iot_readings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.iot_readings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.iot_readings_id_seq OWNER TO postgres;

--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 275
-- Name: iot_readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.iot_readings_id_seq OWNED BY public.iot_readings.id;


--
-- TOC entry 257 (class 1259 OID 17226)
-- Name: lab_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_orders (
    lab_order_id character varying(20) NOT NULL,
    patient_id character varying(20),
    doctor_id character varying(20),
    test_name character varying(100),
    priority character varying(20) DEFAULT 'Normal'::character varying,
    order_date date DEFAULT CURRENT_DATE,
    price numeric(10,2),
    status character varying(20),
    notes text,
    CONSTRAINT lab_orders_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Processing'::character varying, 'Completed'::character varying])::text[])))
);


ALTER TABLE public.lab_orders OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 17217)
-- Name: lab_test_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_test_types (
    test_type_id integer NOT NULL,
    test_name character varying(100),
    price numeric(10,2),
    tat_hours integer
);


ALTER TABLE public.lab_test_types OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17216)
-- Name: lab_test_types_test_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_test_types_test_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_test_types_test_type_id_seq OWNER TO postgres;

--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 255
-- Name: lab_test_types_test_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_test_types_test_type_id_seq OWNED BY public.lab_test_types.test_type_id;


--
-- TOC entry 265 (class 1259 OID 17271)
-- Name: medicine_stock_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine_stock_logs (
    id integer NOT NULL,
    medicine_id character varying(20),
    change_qty integer,
    reason character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medicine_stock_logs OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 17270)
-- Name: medicine_stock_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_stock_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_stock_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 264
-- Name: medicine_stock_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_stock_logs_id_seq OWNED BY public.medicine_stock_logs.id;


--
-- TOC entry 263 (class 1259 OID 17263)
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    medicine_id character varying(20) NOT NULL,
    medicine_name character varying(100),
    category character varying(50),
    manufacturer character varying(100),
    batch_number character varying(50),
    expiry_date date,
    stock_quantity integer,
    min_stock integer,
    purchase_price numeric(10,2),
    mrp numeric(10,2),
    storage_location character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medicines OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 17366)
-- Name: notification_recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_recipients (
    id integer NOT NULL,
    notification_id integer,
    recipient_name character varying(100),
    recipient_contact character varying(100)
);


ALTER TABLE public.notification_recipients OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 17365)
-- Name: notification_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_recipients_id_seq OWNER TO postgres;

--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 281
-- Name: notification_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_recipients_id_seq OWNED BY public.notification_recipients.id;


--
-- TOC entry 280 (class 1259 OID 17355)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    channel character varying(20),
    category character varying(50),
    subject character varying(150),
    message text,
    status character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 17354)
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
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 279
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- TOC entry 268 (class 1259 OID 17298)
-- Name: patient_visit_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_visit_analytics (
    report_month character varying(7),
    visit_type character varying(30),
    visit_percent integer
);


ALTER TABLE public.patient_visit_analytics OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 17469)
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patient_id character varying(20) NOT NULL,
    full_name character varying(100),
    age integer,
    gender character varying(10),
    blood_group character varying(5),
    abha_id character varying(25),
    phone character varying(20),
    email character varying(100),
    address text,
    medical_history text,
    insurance_id character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 17446)
-- Name: payment_gateway_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_gateway_config (
    gateway_name character varying(50) NOT NULL,
    api_key text,
    api_secret text,
    test_mode boolean,
    last_transaction timestamp without time zone
);


ALTER TABLE public.payment_gateway_config OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 17393)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    permission_name character varying(100)
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 17392)
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_permission_id_seq OWNER TO postgres;

--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 287
-- Name: permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;


--
-- TOC entry 252 (class 1259 OID 17198)
-- Name: prescription_lab_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_lab_tests (
    id integer NOT NULL,
    prescription_id character varying(20),
    test_name character varying(100)
);


ALTER TABLE public.prescription_lab_tests OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 17197)
-- Name: prescription_lab_tests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_lab_tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_lab_tests_id_seq OWNER TO postgres;

--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 251
-- Name: prescription_lab_tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_lab_tests_id_seq OWNED BY public.prescription_lab_tests.id;


--
-- TOC entry 250 (class 1259 OID 17190)
-- Name: prescription_medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_medicines (
    id integer NOT NULL,
    prescription_id character varying(20),
    medicine_name character varying(100),
    dosage character varying(50),
    frequency character varying(50),
    duration character varying(50)
);


ALTER TABLE public.prescription_medicines OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 17189)
-- Name: prescription_medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_medicines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_medicines_id_seq OWNER TO postgres;

--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 249
-- Name: prescription_medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_medicines_id_seq OWNED BY public.prescription_medicines.id;


--
-- TOC entry 248 (class 1259 OID 17179)
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    prescription_id character varying(20) NOT NULL,
    patient_id character varying(20) NOT NULL,
    doctor_id character varying(20),
    appointment_id integer,
    diagnosis text,
    follow_up_date date,
    notes text,
    created_at date DEFAULT CURRENT_DATE
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 17284)
-- Name: report_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_snapshots (
    report_date date NOT NULL,
    total_appointments integer,
    total_revenue numeric(12,2),
    patient_visits integer,
    avg_doctor_rating numeric(3,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report_snapshots OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 17400)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 17383)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50)
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 17382)
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
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 285
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 284 (class 1259 OID 17374)
-- Name: scheduled_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduled_notifications (
    id integer NOT NULL,
    notification_id integer,
    scheduled_at timestamp without time zone,
    sent boolean DEFAULT false
);


ALTER TABLE public.scheduled_notifications OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 17373)
-- Name: scheduled_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scheduled_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scheduled_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 283
-- Name: scheduled_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scheduled_notifications_id_seq OWNED BY public.scheduled_notifications.id;


--
-- TOC entry 293 (class 1259 OID 17419)
-- Name: security_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.security_alerts (
    alert_id integer NOT NULL,
    alert_message text,
    severity character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.security_alerts OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 17418)
-- Name: security_alerts_alert_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.security_alerts_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.security_alerts_alert_id_seq OWNER TO postgres;

--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 292
-- Name: security_alerts_alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.security_alerts_alert_id_seq OWNED BY public.security_alerts.alert_id;


--
-- TOC entry 296 (class 1259 OID 17440)
-- Name: user_notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notification_preferences (
    user_id integer NOT NULL,
    email_enabled boolean,
    sms_enabled boolean,
    in_app_enabled boolean
);


ALTER TABLE public.user_notification_preferences OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 17430)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100),
    email character varying(100),
    phone character varying(20),
    role character varying(50),
    password_hash text,
    two_factor_enabled boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 17429)
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
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 294
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 302 (class 1259 OID 17477)
-- Name: vitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vitals (
    patient_id character varying(20),
    bp character varying(10),
    heart_rate integer,
    temperature numeric(4,1),
    weight numeric(5,2),
    height numeric(5,2),
    bmi numeric(4,1),
    reading_time timestamp without time zone
);

