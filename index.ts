import axios, { AxiosRequestConfig, Method } from "axios";

/**
 * @var baseUrl
 * @description The base URL of the WebUntis API (e.g. borys.webuntis.com)
 * 
 * @type {string | null}
 */
export let baseUrl: string | null = null;

/**
 * @function SetBaseUrl
 * @description A function to set the base URL of the WebUntis API
 * 
 * @param {string} url The base URL of the WebUntis API (e.g. borys.webuntis.com)
 * 
 * @returns {void}
 */
export function SetBaseUrl(url: string): void {
    baseUrl = url;
}

/**
 * @var school
 * @description The school name of the WebUntis API (e.g. hubert-sternberg)
 */
export let school: string | null = null;

/**
 * @function SetSchool
 * @description A function to set the school name of the WebUntis API
 * 
 * @param {string} schoolName The school name of the WebUntis API (e.g. hubert-sternberg)
 * 
 * @returns {void}
 */
export function SetSchool(schoolName: string): void {
    school = schoolName;
}

/**
 * @var user
 * @description The username of the WebUntis API
 * 
 * @type {string | null}
 */
export let user: string | null = null;

/**
 * @function SetUsername
 * @description A function to set the username of the WebUntis API
 * 
 * @param {string} name The username of the WebUntis API
 * 
 * @returns {void}
 */
export function SetUser(name: string): void {
    user = name;
}

/**
 * @var password
 * @description The password of the WebUntis API
 * 
 * @type {string | null}
 */
export let password: string | null = null;

/**
 * @function SetPassword
 * @description A function to set the password of the WebUntis API
 * 
 * @param {string} value The password of the WebUntis API
 * 
 * @returns {void}
 */
export function SetPassword(value: string): void {
    password = value;
}

/**
 * @type {KeyValuePair}
 * @description A key value pair
 * 
 * @type {K} The type of the key
 * @type {V} The type of the value
 */
export type KeyValuePair<K extends string | number, V> = {
    [key in K]: V;
}

/**
 * @type {GenericObject}
 * @description A generic object
 */
export type GenericObject = string | number | boolean | null | undefined;

/**
 * @type {Route}
 * @description The route of the request
 */
export type Route = "public" | "rest" | "token";

/**
 * @type {AuthenticationType}
 * @description The authentication type of the request
 */
export type AuthenticationType = "cookie" | "token";

/**
 * @function Request
 * @description A function to make a request to the WebUntis API
 * 
 * @param {Method | string} method The method of the request
 * @param {Route} route The route of the request
 * @param {string} path The path of the request
 * @param {KeyValuePair<string, GenericObject>} params The parameters of the request
 * 
 * @returns {Promise<T>}
 */
export async function ApiRequest<T>(method: Method, route: Route, path?: string, params?: KeyValuePair<string, GenericObject>, authentication: AuthenticationType = "cookie"): Promise<T> {
    await GetSession();

    const config: AxiosRequestConfig = {
        url: `https://${baseUrl}/WebUntis/api/${route}/${path}`,
        params: params,
        method: method,
        headers: {
            ["Content-Type"]: "application/json"
        }
    }

    if (authentication === "token") {
        const token = await GetJwtToken();

        config.headers!["Authorization"] = `Bearer ${token}`;
    } else {
        config.headers!["Cookie"] = BuildCookie();
    }

    const response = await axios.request<T>(config);

    return response.data;
}

/**
 * @type {JsonRPCMethod}
 * @description The JSON RPC method of the request
 */
export type JsonRPCMethod = "authenticate" | "logout" | "getLatestImportTime" | "getTimetable";

/**
 * @interface JsonRPCResponse
 * @description The JSON RPC response of the request
 * 
 * @property {string} jsonrpc The JSON RPC version of the response
 * @property {string} id The ID of the response
 * @property {T} result The result of the response
 */
export interface JsonRPCResponse<T> {
    jsonrpc: "2.0";
    id: string;
    result: T;
}

/**
 * @interface Session
 * @description The session of the user
 * 
 * @property {string} sessionId The session ID of the user
 * @property {number} personType The person type of the user
 * @property {number} personId The person ID of the user
 * @property {number} klasseId The class ID of the user
 */
export interface Session {
    sessionId: string;
    personType: PersonType;
    personId: number;
    klasseId: number;
}

/**
 * @var session
 * @description The current session of the runtime
 * 
 * @type {Session | null}
 */
export let session: Session | null = null;

/**
 * @interface BasicCredentials
 * @description The basic credentials of the user
 * 
 * @property {string} user The username of the user
 * @property {string} password The password of the user
 */
export interface BasicCredentials {
    user: string | null;
    password: string | null;
}

/**
 * @interface Cookie
 * @description The cookie to validate the session
 * 
 * @property {string} JSESSIONID The session ID of the user
 * @property {string} schoolname The school name of the user (Base64 encoded)
 */
export interface Cookie {
    JSESSIONID: string;
    schoolname: string;
} 

/**
 * @function BuildCookie
 * @description A function to build the cookie to validate the session
 * 
 * @returns {string}
 */
export function BuildCookie(): string | null {
    if (school && session) {
        const cookie: Cookie = {
            JSESSIONID: session.sessionId,
            schoolname: Buffer.from(school).toString("base64")
        }
    
        return Object.entries(cookie).map(([key, value]) => `${key}=${value}`).join("; ");
    }

    return null;
}

/**
 * @function Request
 * @description A function to make a request to the WebUntis API
 * 
 * @param {JsonRPCMethod | string} method The method of the request
 * @param {T} params The parameters of the request
 * 
 * @returns {Promise<T>}
 */
export async function JsonRPCRequest<T>(method: JsonRPCMethod, params?: 
    T extends Session ? BasicCredentials :
    T extends Lesson[] ? Options<TimeTableOptions> :
    any
): Promise<T> {
    const config: AxiosRequestConfig = {
        url: `https://${baseUrl}/WebUntis/jsonrpc.do`,
        method: "POST",
        params: {
            school
        },
        headers: {
            Cookie: BuildCookie()
        },
        data: {
            id: "Awesome",
            method,
            params,
            jsonrpc: "2.0"
        }
    }

    const response = await axios.request<JsonRPCResponse<T>>(config);

    return response.data.result;
}

/**
 * @function GetSession
 * @description A function to get the current session of the runtime and request a new one if there is no session
 * 
 * @returns {Promise<Session>}
 */
export async function GetSession(): Promise<Session> {
    const currentSession: Session = session || await JsonRPCRequest("authenticate", {
        user,
        password
    });

    if (!session) {
        session = currentSession;

        const latestImportTime: number = await JsonRPCRequest("getLatestImportTime");

        setTimeout(() => session = null, Date.now() - latestImportTime);
    }

    return currentSession;
}

/**
 * @function Logout
 * @description A function to logout and delete the current session
 * 
 * @returns {Promise<void>}
 */
export async function Logout(): Promise<void> {
    await JsonRPCRequest("logout");
    session = null;
}

/**
 * @function GetJwtToken
 * @description A function to get the JWT token of the user
 * 
 * @returns {Promise<string>}
 */
export async function GetJwtToken(): Promise<string> {
    return await ApiRequest("GET", "token", "new");
}

/**
 * @interface Options
 * @description The options of the request
 * 
 * @property {T} options The options of the request
 * 
 * @type {T} The type of the options
 */
export interface Options<T> {
    options: T;
}

/**
 * @enum {ElementType}
 * @description The type of the element
 * 
 * @property {number} KLASSE The class type
 * @property {number} TEACHER The teacher type
 * @property {number} SUBJECT The subject type
 * @property {number} ROOM The room type
 * @property {number} STUDENT The student type
 */
export enum PersonType {
    KLASSE = 1,
    TEACHER = 2,
    SUBJECT = 3,
    ROOM = 4,
    STUDENT = 5,
}

/**
 * @type {ElementKeyType}
 * @description The type of the key of the element
 */
export type ElementKeyType = "id" | "name" | "externalkey";

/**
 * @type {TimeTableFields}
 * @description The fields of the time table
 * 
 * @extends {ElementKeyType}
 */
export type TimeTableFields = "longname" | ElementKeyType;

/**
 * @enum {LessonType}
 * @description The type of the lesson
 * 
 * @property {string} LESSON The lesson type
 * @property {string} OFFICE_HOUR The office hour type
 * @property {string} STANDBY The standby type
 * @property {string} BREAK_SUPERVISION The break supervision type
 * @property {string} EXAMINATION The examination type
 */
export enum LessonType {
    LESSON = "lh",
    OFFICE_HOUR = "oh",
    STANDBY = "sb",
    BREAK_SUPERVISION = "bs",
    EXAMINATION = "ex"
}

/**
 * @type {LessonCode}
 * @description The code of the lesson
 */
export type LessonCode = "cancelled" | "irregular";

/**
 * @interface Lesson
 * @description The lesson of the time table
 * 
 * @property {number} id The ID of the period lesson
 * @property {number} date The date of the period lesson
 * @property {number} startTime The start time of the period lesson
 * @property {number} endTime The end time of the period lesson
 * @property {LessonType} lstype The type of the period lesson
 * @property {LessonCode} code The code of the period lesson which is ommited if there is no code
 * @property {string} info The information of the period lesson
 * @property {string} substText The substitution text of the period lesson
 * @property {string} lstext The text of the period lesson
 * @property {number} lsnumber The number of the period lesson
 * @property {string} statflags The statistical flags of the period lesson
 * @property {string} activityType The activity type of the period lesson which is ommited if there is no activity type
 * @property {string} sg The student group of the period lesson
 * @property {string} bkRemark The remark of the period lesson
 * @property {string} bkText The text of the period lesson
 * @property {TimeTableFields[]} kl The fields of the class
 * @property {TimeTableFields[]} te The fields of the teacher
 * @property {TimeTableFields[]} su The fields of the subject
 * @property {TimeTableFields[]} ro The fields of the room
 */
export interface Lesson {
    id: number;
    date: number;
    startTime: number;
    endTime: number;
    lstype: LessonType;
    code: LessonCode;
    info: string;
    substText: string;
    lstext: string;
    lsnumber: number;
    statflags: string;
    activityType: string;
    sg: string;
    bkRemark?: string;
    bkText?: string;
    kl: TimeTableFields[];
    te: TimeTableFields[];
    su: TimeTableFields[];
    ro: TimeTableFields[];
}

/**
 * @interface TimeTableElement
 * @description The element of the time table
 * 
 * @property {number | string} id The internal ID of the element, name or external key
 * @property {ElementType} type The type of the element
 * @property {ElementKeyType} keyType The type of the key of the element
 */
export interface TimeTableElement {
    id: number | string;
    type: PersonType;
    keyType?: ElementKeyType;
}

/**
 * @interface TimeTableOptions
 * @description The options of the time table
 * 
 * @property {TimeTableElement} element The element of the time table
 * @property {string} startDate The start date of the time table with the format YYYYMMDD
 * @property {string} endDate The end date of the time table with the format YYYYMMDD
 * @property {boolean} onlyBaseTimetable The flag to show only the base time table
 * @property {boolean} showBooking The flag to show the booking
 * @property {boolean} showInfo The flag to show the information
 * @property {boolean} showSubstText The flag to show the substitution text
 * @property {boolean} showLsText The flag to show the lesson text
 * @property {boolean} showLsNumber The flag to show the lesson number
 * @property {boolean} showStudentgroup The flag to show the student group
 * @property {TimeTableFields[]} klasseFields The fields of the class
 * @property {TimeTableFields[]} roomFields The fields of the room
 * @property {TimeTableFields[]} subjectFields The fields of the subject
 * @property {TimeTableFields[]} teacherFields The fields of the teacher
 */
export interface TimeTableOptions {
    element: TimeTableElement,
    startDate?: string;
    endDate?: string;
    onlyBaseTimetable?: boolean;
    showBooking?: boolean;
    showInfo?: boolean;
    showSubstText?: boolean;
    showLsText?: boolean;
    showLsNumber?: boolean;
    showStudentgroup?: boolean;
    klasseFields?: TimeTableFields[];
    roomFields?: TimeTableFields[];
    subjectFields?: TimeTableFields[];
    teacherFields?: TimeTableFields[];
}

/**
 * @function FormatDateToUntis
 * @description A function to format the date to the WebUntis API
 * 
 * @param {Date} date The date to format
 * 
 * @returns {string}
 */
export function FormatDateToUntis(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
}

/**
 * @function GetTimeTable
 * @description A function to get the time table of the element
 * 
 * @param {Date} startDate The start date of the time table
 * @param {Date} endDate The end date of the time table
 * 
 * @returns {Promise<Lesson[]>}
 */
export async function GetTimeTable(startDate?: Date, endDate?: Date): Promise<Lesson[]> {
    const session = await GetSession();

    const options: TimeTableOptions = {
        element: {
            id: session.personId,
            type: session.personType
        },
        showBooking: true,
        showInfo: true,
        showLsNumber: true,
        showLsText: true,
        showStudentgroup: true,
        showSubstText: true,
        klasseFields: [
            "id",
            "name",
            "externalkey",
            "longname"
        ],
        roomFields: [
            "id",
            "name",
            "externalkey",
            "longname"
        ],
        subjectFields: [
            "id",
            "name",
            "externalkey",
            "longname"
        ],
        teacherFields: [
            "id",
            "name",
            "externalkey",
            "longname"
        ]
    }

    if (startDate) options.startDate = FormatDateToUntis(startDate);
    if (endDate) options.endDate = FormatDateToUntis(endDate);

    return await JsonRPCRequest("getTimetable", {
        options: options
    })
}

/**
 * @class UntisDate
 * @description A class to format the date to the ISO format
 * 
 * @extends {Date}
 */
export class UntisDate extends Date {
    constructor(date: number, time: number) {
        const dateString = date.toString();
        const timeString = time.toString();

        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6));
        const day = parseInt(dateString.substring(6, 8));

        const paddedTime = timeString.padStart(4, "0");
        const hours = parseInt(paddedTime.substring(0, 2));
        const minutes = parseInt(paddedTime.substring(2, 4));

        super(year, month - 1, day, hours, minutes);
    }

    /**
     * @function formatField
     * @description A function to format the field
     * 
     * @param {number} value The value to format
     * 
     * @returns {string}
     */
    formatField(value: number): string {
        return value.toString().padStart(2, "0");
    } 

    /**
     * @function toISOFormat
     * @description A function to format the date to the ISO format
     * 
     * @returns {string}
     */
    toISOFormat(): string {
        const year = this.getFullYear();
        const month = this.formatField(this.getMonth() + 1);
        const day = this.formatField(this.getDate());

        const hours = this.formatField(this.getHours());
        const minutes = this.formatField(this.getMinutes());
        const seconds = this.formatField(this.getSeconds());

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    }
}

/**
 * @interface CalendarEntries
 * @description The calendar entries of the request
 * 
 * @property {T} calendarEntries The calendar entries of the request
 * 
 * @type {T} The type of the calendar entries
 */
export interface CalendarEntries<T> {
    calendarEntries: T[];
}

/**
 * @interface Exam
 * @description The exam of the calendar entry
 * 
 * @property {string} description The description of the exam
 * @property {number} id The ID of the exam
 * @property {string} name The name of the exam
 * @property {string} typeLongName The long name of the exam
 */
export interface Exam {
    description: string;
    id: number;
    name: string;
    typeLongName: string;
}

/**
 * @interface Homework
 * @description The homework of the calendar entry
 * 
 * @property {any[]} attachments The attachments of the homework
 * @property {boolean} completed The flag to show if the homework is completed
 * @property {string} dateTime The date time of the homework
 * @property {string} dueDateTime The due date time of the homework
 * @property {number} id The ID of the homework
 * @property {string} remark The remark of the homework
 * @property {string} text The text of the homework
 */
export interface Homework {
    attachments: any[];
    completed: boolean;
    dateTime: string;
    dueDateTime: string;
    id: number;
    remark: string;
    text: string;
}

/**
 * @interface Lesson
 * @description The lesson of the calendar entry
 * 
 * @property {number} lessonId The ID of the lesson
 * @property {number} lessonNumber The number of the lesson
 */
export interface Lesson {
    lessonId: number;
    lessonNumber: number;
}

/**
 * @type {Status}
 * @description The status of an element
 */
export type Status = 'REGULAR' | 'ABSENT' | 'SUBSTITUTED';

/**
 * @interface Room
 * @description The room of the calendar entry
 * 
 * @property {Status} status The status of the room
 * 
 * @extends {Element}
 */
export type Room = {
    status: Status;
} & Element;

/**
 * @interface MinimalElement
 * @description The minimal element e.g. class, teacher, subject, room or student
 * 
 * @property {number} id The ID of the element
 * @property {string} displayName The display name of the element
 */
export interface MinimalElement {
    id: number;
    displayName: string;
}

/**
 * @interface Element
 * @description The element e.g. class, teacher, subject, room or student
 * 
 * @property {boolean} hasTimetable The flag to show if the element has a timetable
 * @property {string} longName The long name of the element
 * @property {string} shortName The short name of the element
 * 
 * @extends {MinimalElement}
 */
export type Element = {
    hasTimetable: boolean;
    longName: string;
    shortName: string;
} & MinimalElement;

/**
 * @interface SubType
 * @description The sub type of the calendar entry
 * 
 * @property {boolean} displayInPeriodDetails The flag to show if the calendar entry is displayed in the period details
 */
export type SubType = {
    displayInPeriodDetails: boolean;
} & MinimalElement;

/**
 * @interface Teacher
 * @description The teacher of the calendar entry
 * 
 * @property {Status} status The status of the teacher
 * @property {string} imageUrl The image URL of the teacher
 * 
 * @extends {Element}
 */
export type Teacher = {
    status: Status;
    imageUrl: string | null;
} & Element;

/**
 * @interface CalendarEntry
 * @description The calendar entry of the request
 * 
 * @property {number} id The ID of the calendar entry
 * @property {number} previousId The previous ID of the calendar entry
 * @property {number} nextId The next ID of the calendar entry
 * @property {number | null} absenceReasonId The absence reason ID of the calendar entry
 * @property {any | null} booking The booking of the calendar entry
 * @property {any | null} color The color of the calendar entry
 * @property {string} endDateTime The end date time of the calendar entry
 * @property {Exam | null} exam The exam of the calendar entry
 * @property {Homework[]} homeworks The homeworks of the calendar entry
 * @property {Element[]} klasses The classes of the calendar entry
 * @property {Lesson} lesson The lesson of the calendar entry
 * @property {string | null} lessonInfo The lesson info of the calendar entry
 * @property {any | null} mainStudentGroup The main student group of the calendar entry
 * @property {any | null} notesAll The notes of all of the calendar entry
 * @property {any[]} notesAllFiles The note files of all of the calendar entry
 * @property {any | null} notesStaff The notes of the staff of the calendar entry
 * @property {any[]} notesStaffFiles The note files of the staff of the calendar entry
 * @property {any | null} originalCalendarEntry The original calendar entry of the calendar entry
 * @property {string[]} permissions The permissions of the calendar entry
 * @property {any[]} resources The resources of the calendar entry
 * @property {Room[]} rooms The rooms of the calendar entry
 * @property {any[]} singleEntries The single entries of the calendar entry
 * @property {string} startDateTime The start date time of the calendar entry
 * @property {string} status The status of the calendar entry
 * @property {any[]} students The students of the calendar entry
 * @property {SubType} subType The sub type of the calendar entry
 * @property {Element} subject The subject of the calendar entry
 * @property {string | null} substText The substitution text of the calendar entry
 * @property {Teacher[]} teachers The teachers of the calendar entry
 * @property {string | null} teachingContent The teaching content of the calendar entry
 * @property {any[]} teachingContentFiles The teaching content files of the calendar entry
 * @property {string} type The type of the calendar entry
 * @property {any | null} videoCall The video call of the calendar entry
 * @property {any[]} integrationsSection The integrations section of the calendar entry
 */
export interface CalendarEntry {
    id: number;
    previousId: number;
    nextId: number;
    absenceReasonId: any | null;
    booking: any | null;
    color: any | null;
    endDateTime: string;
    exam: Exam | null;
    homeworks: Homework[];
    klasses: Element[];
    lesson: Lesson,
    lessonInfo: string | null;
    mainStudentGroup: any | null;
    notesAll: any | null;
    notesAllFiles: any[];
    notesStaff: any | null;
    notesStaffFiles: any[];
    originalCalendarEntry: any | null;
    permissions: string[];
    resources: any[];
    rooms: Room[];
    singleEntries: any[];
    startDateTime: string;
    status: string;
    students: any[];
    subType: SubType;
    subject: Element;
    substText: string | null;
    teachers: Teacher[];
    teachingContent: string | null;
    teachingContentFiles: any[];
    type: string;
    videoCall: any | null;
    integrationsSection: any[];
}

/**
 * @function FetchCalendarEntryDetails
 * @description A function to fetch the calendar entry details of the lesson
 * 
 * @param {Lesson} lesson The lesson to fetch the calendar entry details
 * 
 * @returns {Promise<CalendarEntries<CalendarEntry>>}
 */
export async function FetchCalendarEntryDetails(lesson: Lesson): Promise<CalendarEntries<CalendarEntry>> {
    const session = await GetSession();

    const startDate = new UntisDate(lesson.date, lesson.startTime);
    const endDate = new UntisDate(lesson.date, lesson.endTime);

    return await ApiRequest("GET", "rest", "view/v2/calendar-entry/detail", {
        elementId: session.personId,
        elementType: session.personType,
        startDateTime: startDate.toISOFormat(),
        endDateTime: endDate.toISOFormat()
    }, "token")
}